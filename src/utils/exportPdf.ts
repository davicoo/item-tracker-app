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
  const topOffset = 35;
  const gap = 4;
  const columns = 4;

  const cardWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const cardHeight = 60;

  doc.setFontSize(18);
  doc.text('Item Tracker', pageWidth / 2, 15, { align: 'center' });

  // Attempt to load and draw the logo
  try {
    const logoUrl = await loadImageAsDataUrl('/images/items/200.png');
    doc.addImage(logoUrl, 'PNG', margin, 8, 15, 15);
  } catch (err) {
    console.error('Failed to load logo', err);
  }

  let x = margin;
  let y = topOffset;
  let col = 0;

  for (const item of items) {
    // Draw card background
    doc.setDrawColor(200);
    doc.rect(x, y, cardWidth, cardHeight);

    let textY = y + 6;
    doc.setFontSize(12);
    doc.text(item.name, x + 2, textY);
    textY += 5;
    doc.setFontSize(10);
    doc.text(`Price: $${item.price}`, x + 2, textY);
    textY += 5;
    doc.text(`Status: ${item.status}`, x + 2, textY);

    // Draw image if available
    if (item.imageUrl) {
      try {
        const dataUrl = await loadImageAsDataUrl(item.imageUrl);
        const imgHeight = 30;
        const imgWidth = cardWidth - 4;
        doc.addImage(dataUrl, 'JPEG', x + 2, y + cardHeight - imgHeight - 2, imgWidth, imgHeight);
      } catch (err) {
        console.error('Failed to load image', err);
      }
    }

    // Move to next column/row
    col += 1;
    if (col >= columns) {
      col = 0;
      x = margin;
      y += cardHeight + gap;
    } else {
      x += cardWidth + gap;
    }

    if (y + cardHeight > pageHeight - margin) {
      doc.addPage();
      x = margin;
      y = topOffset;
      col = 0;
    }
  }

  doc.save('items.pdf');
}
