import jsPDF from 'jspdf';
import type { Item } from '../types/item';

async function loadImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportItemsToPdf(items: Item[]): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const rowHeight = 30;

  doc.setFontSize(18);
  doc.text('Item Tracker', pageWidth / 2, 15, { align: 'center' });

  // Attempt to load and draw the logo
  try {
    const logoUrl = await loadImageAsDataUrl('/images/items/200.png');
    doc.addImage(logoUrl, 'PNG', margin, 8, 15, 15);
  } catch (err) {
    console.error('Failed to load logo', err);
  }

  let y = 25;

  for (const item of items) {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = 25;
    }

    const imgSize = 20;
    const textX = margin + imgSize + 4;

    // Draw container
    doc.setDrawColor(200);
    doc.rect(margin, y - 5, pageWidth - margin * 2, rowHeight);

    // Draw image if available
    if (item.imageUrl) {
      try {
        const dataUrl = await loadImageAsDataUrl(item.imageUrl);
        doc.addImage(dataUrl, 'JPEG', margin + 2, y, imgSize, imgSize);
      } catch (err) {
        console.error('Failed to load image', err);
      }
    }

    doc.setFontSize(12);
    doc.text(item.name, textX, y + 5);

    doc.setFontSize(10);
    const details = doc.splitTextToSize(item.details, pageWidth - textX - margin);
    doc.text(details, textX, y + 10);
    doc.text(`$${item.price}`, textX, y + 15);
    doc.text(item.location, textX + 35, y + 15);
    doc.text(item.status, textX + 70, y + 15);

    y += rowHeight;
  }

  doc.save('items.pdf');
}
