import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelFilePath = path.resolve(__dirname, '../../Listado de Tiendas_Augusto.xlsx');
const outputMockPath = path.resolve(__dirname, '../data/mockStores.js');

function parseExcel() {
  console.log('Leyendo Excel...', excelFilePath);
  const buf = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const stores = [];

  // Parse CHEDRAUI
  if (workbook.Sheets['CHEDRAUI']) {
    const chedData = XLSX.utils.sheet_to_json(workbook.Sheets['CHEDRAUI'], { header: 'A' });
    // Fila 0 es header. A: Tienda, B: Centro, C: Formato, D: Estado, E: % Part, F: Productos catalogados, G: Latitud, H: Longitud
    chedData.slice(1).forEach((row, i) => {
      if (!row['A']) return;
      
      const latRaw = row['G'];
      const lngRaw = row['H'];
      
      let lat = parseFloat(latRaw);
      let lng = parseFloat(lngRaw);
      
      let needsReview = false;
      let notes = [];
      
      if (lng > 0) {
        lng = lng * -1;
        needsReview = true;
        notes.push('Longitud positiva corregida a negativa.');
      }
      
      const isValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

      stores.push({
        id: `ched-${i}`,
        source_sheet: 'CHEDRAUI',
        chain: 'CHEDRAUI',
        store_code: row['A']?.toString(),
        center_name: row['B']?.toString(),
        store_format: row['C']?.toString(),
        state_raw: row['D']?.toString(),
        state_normalized: row['D']?.toString().toUpperCase().trim(),
        address_raw: null,
        latitude: isValidCoords ? lat : null,
        longitude: isValidCoords ? lng : null,
        latitude_raw: latRaw?.toString() || null,
        longitude_raw: lngRaw?.toString() || null,
        participation_percentage: row['E'],
        cataloged_products_count: parseInt(row['F'], 10) || 0,
        needs_geocoding: !isValidCoords,
        needs_review: needsReview,
        data_quality_notes: notes.join(' | ') || null,
      });
    });
  }

  // Parse LA COMER
  if (workbook.Sheets['LA COMER']) {
    const comerData = XLSX.utils.sheet_to_json(workbook.Sheets['LA COMER'], { header: 'A' });
    // Fila 0 header: A: Tienda, B: Centro, C: Formato, D: Estado, E: % Part, F: Productos catalogados, G: Direccion, H: Latitud, I: Longitud
    comerData.slice(1).forEach((row, i) => {
      if (!row['A']) return;

      const latRaw = row['H'];
      const lngRaw = row['I'];

      let lat = parseFloat(latRaw);
      let lng = parseFloat(lngRaw);

      let needsReview = false;
      let notes = [];

      if (lng > 0) {
        lng = lng * -1;
        needsReview = true;
        notes.push('Longitud positiva corregida a negativa.');
      }

      const isValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

      stores.push({
        id: `comer-${i}`,
        source_sheet: 'LA COMER',
        chain: 'LA COMER',
        store_code: row['A']?.toString(),
        center_name: row['B']?.toString(),
        store_format: row['C']?.toString(),
        state_raw: row['D']?.toString(),
        state_normalized: row['D']?.toString().toUpperCase().trim(),
        address_raw: row['G']?.toString() || null,
        latitude: isValidCoords ? lat : null,
        longitude: isValidCoords ? lng : null,
        latitude_raw: latRaw?.toString() || null,
        longitude_raw: lngRaw?.toString() || null,
        participation_percentage: row['E'],
        cataloged_products_count: parseInt(row['F'], 10) || 0,
        needs_geocoding: !isValidCoords,
        needs_review: needsReview,
        data_quality_notes: notes.join(' | ') || null,
      });
    });
  }

  console.log(`Procesadas ${stores.length} tiendas.`);
  
  // Guardar archivo
  if (!fs.existsSync(path.dirname(outputMockPath))) {
    fs.mkdirSync(path.dirname(outputMockPath), { recursive: true });
  }

  const fileContent = `export const mockStores = ${JSON.stringify(stores, null, 2)};\n`;
  fs.writeFileSync(outputMockPath, fileContent, 'utf-8');
  console.log('Mock generado en:', outputMockPath);
}

parseExcel();
