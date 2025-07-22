import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportItemsToPdf } from './exportPdf';

/**
 * Export given data in the specified format.
 * @param {any[]} data Array of objects to export
 * @param {'xlsx'|'csv'|'json'|'pdf'} format Desired file format
 */
export async function exportDataAs(data, format) {
  switch (format) {
    case 'xlsx': {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'items.xlsx');
      break;
    }
    case 'csv': {
      if (!Array.isArray(data)) data = [data];
      const headers = Object.keys(data[0] || {});
      const lines = data.map(row => headers.map(h => {
        const val = row[h] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','));
      const csv = [headers.join(','), ...lines].join('\n');
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'items.csv');
      break;
    }
    case 'json': {
      const json = JSON.stringify(data, null, 2);
      saveAs(new Blob([json], { type: 'application/json' }), 'items.json');
      break;
    }
    case 'pdf': {
      await exportItemsToPdf(data);
      break;
    }
    default:
      console.error('Unsupported export format:', format);
  }
}
