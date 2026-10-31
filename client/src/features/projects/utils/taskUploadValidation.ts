const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  'image/jpeg': 'JPEG image',
  'image/png': 'PNG image',
  'image/gif': 'GIF image',
  'image/webp': 'WebP image',
  'application/pdf': 'PDF document',
  'text/plain': 'Plain text file',
  'application/msword': 'Word document (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Word document (.docx)',
  'application/vnd.ms-excel': 'Excel spreadsheet (.xls)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel spreadsheet (.xlsx)',
};

const ACCEPTED_UPLOAD_TYPES = 'JPG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX, XLS, XLSX';
const MAX_UPLOAD_SIZE_MB = 10;

export function getTaskUploadValidationError(file: File): string | null {
  if (!ALLOWED_UPLOAD_TYPES[file.type]) {
    return `"${file.name}" is not an allowed file type. Accepted: ${ACCEPTED_UPLOAD_TYPES}`;
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" exceeds the ${MAX_UPLOAD_SIZE_MB} MB size limit.`;
  }
  return null;
}
