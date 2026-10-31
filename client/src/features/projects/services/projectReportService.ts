import { jsPDF } from 'jspdf';
import type { Project } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';

export function generateProjectPdf(project: Project, tasks: Task[]): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 42;
  const contentWidth = pageWidth - marginX * 2;
  const footerY = pageHeight - 18;
  const leftColWidth = contentWidth / 2 - 10;

  const sortedTasks = [...tasks].sort((a, b) => {
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  const updateFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      doc.setPage(pageIndex);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.line(marginX, footerY - 6, pageWidth - marginX, footerY - 6);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Elderly Care Management System (ECMS)', marginX, footerY);
      doc.text(`Page ${pageIndex} of ${totalPages}`, pageWidth - marginX - 45, footerY, {
        align: 'right',
      });
    }
  };

  const addHeader = () => {
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, pageWidth, 92, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(String('Elderly Care Management System (ECMS)'), marginX, 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(String('Project Report'), marginX, 54);
    doc.text(
      String(
        `Generated: ${new Date().toLocaleDateString()} | Owner: ${project.owner?.username || 'Project Owner'}`,
      ),
      marginX,
      70,
    );
  };

  const drawTaskCard = (task: (typeof tasks)[number], index: number, startY: number) => {
    const numberWidth = 28;
    const gap = 10;
    const titleWidth = contentWidth - numberWidth - gap - 12;
    const titleText = `${String(index + 1).padStart(2, '0')}  ${String(task.title || 'Untitled task')}`;

    const titleLines = doc.splitTextToSize(titleText, titleWidth);
    const titleHeight = titleLines.length * 12;
    const metadataY = startY + titleHeight + 18;
    const cardHeight = Math.max(76, metadataY - startY + 28);

    doc.setFillColor(index % 2 === 0 ? 248 : 252, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginX, startY, contentWidth, cardHeight, 7, 7, 'FD');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(String(index + 1).padStart(2, '0'), marginX + 12, startY + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(titleLines, marginX + numberWidth + 18, startY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(String('Status:'), marginX + 12, metadataY);
    doc.text(String('Due Date:'), marginX + 12 + leftColWidth, metadataY);
    doc.text(String('Priority:'), marginX + 12, metadataY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text(String(task.status || 'Todo'), marginX + 52, metadataY);
    doc.text(
      String(task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'),
      marginX + 12 + leftColWidth + 52,
      metadataY,
    );
    doc.text(String(task.priority || 'Medium'), marginX + 52, metadataY + 14);

    return cardHeight + 10;
  };

  let y = 110;
  addHeader();

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(String('Overview'), marginX, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const descriptionText = `Description: ${project.description || 'No description provided.'}`;
  const descriptionLines = doc.splitTextToSize(descriptionText, contentWidth);
  doc.text(descriptionLines, marginX, y);
  y += descriptionLines.length * 12 + 12;

  const stats = [
    { label: 'Total Tasks', value: String(tasks.length) },
    { label: 'Completed', value: String(tasks.filter((t) => t.status === 'Completed').length) },
    { label: 'In Progress', value: String(tasks.filter((t) => t.status === 'In Progress').length) },
    { label: 'Review', value: String(tasks.filter((t) => t.status === 'Review').length) },
    { label: 'Todo', value: String(tasks.filter((t) => t.status === 'Todo').length) },
  ];

  const statBoxWidth = (contentWidth - 16) / stats.length;
  const statBoxHeight = 48;
  const statStartY = y;
  stats.forEach((stat, index) => {
    const x = marginX + index * (statBoxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, statStartY, statBoxWidth, statBoxHeight, 6, 6, 'FD');
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(String(stat.value), x + statBoxWidth / 2, statStartY + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(String(stat.label), x + statBoxWidth / 2, statStartY + 33, { align: 'center' });
  });

  y = statStartY + statBoxHeight + 22;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(String('Task List'), marginX, y);
  y += 18;

  sortedTasks.forEach((task, index) => {
    const cardHeight = drawTaskCard(task, index, y);
    if (y + cardHeight > pageHeight - 36) {
      doc.addPage();
      addHeader();
      y = 112;
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(String('Task List'), marginX, y);
      y += 18;
      drawTaskCard(task, index, y);
      y += cardHeight;
    } else {
      y += cardHeight;
    }
  });

  updateFooter();
  doc.save(String(`${project.title.replace(/\s+/g, '-').toLowerCase()}-project-report.pdf`));
}
