import jsPDF from 'jspdf';
import type { Item } from '../types/item';
import { fetchStats, type Stats } from './stats';

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
  const rowHeight = 40;

  doc.setFontSize(18);
  doc.text('Item Tracker', pageWidth / 2, 15, { align: 'center' });

  // Attempt to load and draw the logo
  try {
    const logoUrl = await loadImageAsDataUrl('/images/items/200.png');
    doc.addImage(logoUrl, 'PNG', margin, 8, 15, 15);
  } catch (err) {
    console.error('Failed to load logo', err);
  }

  let stats: Stats | null = null;
  try {
    stats = await fetchStats();
  } catch (err) {
    console.error('Failed to fetch stats', err);
  }

  if (stats) {
    doc.setFontSize(10);
    const lines = [
      `Items: ${stats.items}`,
      `Sold: ${stats.sold}`,
      `Paid: ${stats.sold_paid}`,
      `Paid Total: $${stats.sold_paid_total.toFixed(2)}`
    ];
    lines.forEach((line, idx) => {
      doc.text(line, pageWidth - margin, 10 + idx * 4, { align: 'right' });
    });
  }

  let y = 25;

  for (const item of items) {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = 25;
    }

    const imgSize = 20;
    const textX = margin + imgSize + 4;

    // Draw container mimicking app card style
    doc.setDrawColor(220);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, rowHeight, 2, 2, 'FD');

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
    doc.text(item.location, textX + 30, y + 15);
    doc.text(item.status.replace('_', ' '), textX + 60, y + 15);
    doc.text(`Added: ${item.dateAdded.split('T')[0]}`, textX, y + 20);

    y += rowHeight;
  }

  doc.save('items.pdf');
}

