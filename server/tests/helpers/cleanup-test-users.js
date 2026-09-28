async function cleanupTestUsers(prisma, emails) {
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  const userIds = users.map(({ id }) => id);
  if (userIds.length === 0) return;

  const projects = await prisma.project.findMany({
    where: { ownerId: { in: userIds } },
    select: { id: true },
  });
  const projectIds = projects.map(({ id }) => id);

  if (projectIds.length > 0) {
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    const taskIds = tasks.map(({ id }) => id);

    await prisma.attachment.deleteMany({
      where: { OR: [{ projectId: { in: projectIds } }, { taskId: { in: taskIds } }] },
    });
    await prisma.projectInvitation.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.message.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.projectMember.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.task.deleteMany({ where: { projectId: { in: projectIds } } });
    await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
  }

  await prisma.projectMember.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.projectInvitation.deleteMany({
    where: { OR: [{ inviterId: { in: userIds } }, { invitedUserId: { in: userIds } }] },
  });
  await prisma.message.deleteMany({ where: { senderId: { in: userIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

module.exports = cleanupTestUsers;
