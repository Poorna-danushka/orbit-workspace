const prisma = require('../config/prisma');
const {
  uploadBufferToCloudinary,
  createPrivateDownloadUrl,
  deleteCloudinaryAsset,
} = require('../utils/cloudinary.util');
const { isAllowedFileContent } = require('../utils/file-validation.util');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

const inlineImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const cloudinaryHosts = new Set(['api.cloudinary.com', 'res.cloudinary.com']);

const attachmentResponse = (attachment) => {
  const {
    cloudinaryPublicId,
    cloudinaryResourceType,
    cloudinaryFormat,
    mimeType,
    ...response
  } = attachment;
  return { ...response, fileUrl: `/api/uploads/${attachment.id}/content` };
};

const checkProjectAccess = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
  });
  return !!project;
};

// Handles uploading either to a task or to a project directly to Cloudinary
exports.uploadFile = async (req, res) => {
  let uploadResult;
  try {
    const { taskId, projectId } = req.params;
    const userId = req.user.userId;

    if (!taskId && !projectId) {
      return res.status(400).json({ message: 'Missing target id (taskId or projectId)' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!isAllowedFileContent(req.file.mimetype, req.file.buffer)) {
      return res.status(400).json({ message: 'File content does not match an allowed file type' });
    }

    // Verify existence of target and access
    if (taskId) {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      const hasAccess = await checkProjectAccess(task.projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this task's project" });
      }
    }

    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const hasAccess = await checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this project' });
      }
    }

    // Stream buffer to Cloudinary in orbit/attachments folder
    uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'orbit/attachments',
      'auto',
      { type: 'authenticated' },
    );

    const data = {
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      mimeType: req.file.mimetype,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryResourceType: uploadResult.resource_type,
      cloudinaryFormat: uploadResult.format,
    };
    if (taskId) data.taskId = taskId;
    if (projectId) data.projectId = projectId;

    const attachment = await prisma.attachment.create({ data });

    res.status(201).json(attachmentResponse(attachment));
  } catch (error) {
    if (uploadResult?.public_id && uploadResult?.resource_type) {
      try {
        await deleteCloudinaryAsset({
          publicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type,
        });
      } catch (cleanupError) {
        console.error('Failed to clean up unattached Cloudinary upload:', cleanupError);
      }
    }
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Supports listing attachments for a task or for a project
exports.getAttachments = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const userId = req.user.userId;
    if (!taskId && !projectId) return res.status(400).json({ message: 'Missing target id' });

    if (taskId) {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      const hasAccess = await checkProjectAccess(task.projectId, userId);
      if (!hasAccess) return res.status(403).json({ message: "Access denied to this task's project" });
    }

    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      const hasAccess = await checkProjectAccess(projectId, userId);
      if (!hasAccess) return res.status(403).json({ message: 'Access denied to this project' });
    }

    const where = taskId ? { taskId } : { projectId };
    const attachments = await prisma.attachment.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(attachments.map(attachmentResponse));
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttachmentContent = async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    const task = attachment.taskId
      ? await prisma.task.findUnique({ where: { id: attachment.taskId }, select: { projectId: true } })
      : null;
    const projectId = attachment.projectId || task?.projectId;
    if (!projectId) return res.status(404).json({ message: 'Attachment project not found' });
    if (!(await checkProjectAccess(projectId, req.user.userId))) {
      return res.status(403).json({ message: "Access denied to this attachment's project" });
    }

    let sourceUrl;
    if (
      attachment.cloudinaryPublicId &&
      attachment.cloudinaryResourceType
    ) {
      sourceUrl = createPrivateDownloadUrl({
        publicId: attachment.cloudinaryPublicId,
        resourceType: attachment.cloudinaryResourceType,
        format: attachment.cloudinaryFormat || undefined,
      });
    } else {
      const legacyUrl = new URL(attachment.fileUrl);
      if (legacyUrl.protocol !== 'https:' || legacyUrl.hostname !== 'res.cloudinary.com') {
        return res.status(410).json({ message: 'Attachment is unavailable pending secure migration' });
      }
      sourceUrl = legacyUrl.toString();
    }

    let upstream;
    for (let redirects = 0; redirects <= 2; redirects += 1) {
      const source = new URL(sourceUrl);
      if (source.protocol !== 'https:' || !cloudinaryHosts.has(source.hostname)) {
        return res.status(502).json({ message: 'Attachment provider returned an invalid URL' });
      }
      upstream = await fetch(source, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20_000),
      });
      if (![301, 302, 303, 307, 308].includes(upstream.status)) break;
      const location = upstream.headers.get('location');
      if (!location || redirects === 2) {
        return res.status(502).json({ message: 'Attachment provider redirect failed' });
      }
      sourceUrl = new URL(location, source).toString();
    }

    if (!upstream?.ok || !upstream.body) {
      console.error('Cloudinary attachment request failed with status:', upstream?.status);
      return res.status(502).json({ message: 'Unable to retrieve attachment' });
    }

    const contentType = attachment.mimeType || upstream.headers.get('content-type') || 'application/octet-stream';
    const safeName = attachment.fileName
      .replace(/[\r\n]/g, '')
      .replace(/["\\]/g, '_')
      .slice(0, 255) || 'download';
    const encodedName = encodeURIComponent(safeName).replace(/['()]/g, (character) => (
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    ));

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `${inlineImageTypes.has(contentType) ? 'inline' : 'attachment'}; filename*=UTF-8''${encodedName}`,
    );
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    console.error('Get attachment content error:', error?.name || 'Error');
    res.status(502).json({ message: 'Unable to retrieve attachment' });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Check access on related project
    const projectId = attachment.projectId || (attachment.taskId ? (await prisma.task.findUnique({ where: { id: attachment.taskId } }))?.projectId : null);
    if (projectId) {
      const hasAccess = await checkProjectAccess(projectId, userId);
      if (!hasAccess) return res.status(403).json({ message: "Access denied to this attachment's project" });
    } else {
      return res.status(404).json({ message: 'Attachment project not found' });
    }

    if (attachment.cloudinaryPublicId && attachment.cloudinaryResourceType) {
      await deleteCloudinaryAsset({
        publicId: attachment.cloudinaryPublicId,
        resourceType: attachment.cloudinaryResourceType,
      });
    }

    await prisma.attachment.delete({ where: { id } });
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
