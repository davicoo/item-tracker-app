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
  const doc = new jsPDF();
  let y = 10;

  for (const item of items) {
    doc.text(item.name, 10, y);
    y += 6;
    doc.text(`Price: ${item.price}`, 10, y);
    y += 6;
    doc.text(`Status: ${item.status}`, 10, y);
    y += 6;

    if (item.imageUrl) {
      try {
        const dataUrl = await loadImageAsDataUrl(item.imageUrl);
        doc.addImage(dataUrl, 'JPEG', 10, y, 40, 40);
        y += 46;
      } catch (err) {
        console.error('Failed to load image', err);
      }
    }

    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  }

  doc.save('items.pdf');
}
