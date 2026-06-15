import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelFilePath = path.resolve(__dirname, '../../Listado de Tiendas_Augusto.xlsx');
const catalogoFilePath = path.resolve(__dirname, '../../260605_Hoja de catálogo_La Comer_Augusto.xlsx');
const outputMockPath = path.resolve(__dirname, '../data/mockStores.js');

// Homologa variantes del nombre de cadena al nombre canónico
function normalizeChain(raw) {
  if (!raw) return raw;
  const upper = raw.toString().toUpperCase().trim();
  if (upper === 'LA COMER' || upper === 'LACOMER') return 'La Comer';
  if (upper === 'CHEDRAUI') return 'Chedraui';
  return raw.toString().trim();
}

function parseExcel() {
  console.log('Leyendo Listado de Tiendas...', excelFilePath);
  const buf = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(buf, { type: 'buffer' });

  // --- Read Catálogo La Comer for JOIN ---
  console.log('Leyendo Hoja de Catálogo La Comer...', catalogoFilePath);
  const bufCat = fs.readFileSync(catalogoFilePath);
  const wbCat = XLSX.read(bufCat, { type: 'buffer' });

  // Build catalog lookup from "Hoja1" sheet: group product info by Tienda (column B)
  // Hoja1: A=Alcances, B=Tienda, C=Centro, D=Estado, E=UPC, F=Descripción Cliente
  const catalogByStore = {};
  if (wbCat.Sheets['Hoja1']) {
    const catData = XLSX.utils.sheet_to_json(wbCat.Sheets['Hoja1'], { header: 'A' });
    catData.slice(1).forEach(row => {
      const tienda = row['B']?.toString()?.trim();
      if (!tienda) return;
      if (!catalogByStore[tienda]) {
        catalogByStore[tienda] = [];
      }
      catalogByStore[tienda].push({
        upc: row['E']?.toString() || null,
        description: row['F']?.toString() || null,
      });
    });
  }
  console.log(`Catálogo: ${Object.keys(catalogByStore).length} tiendas con productos catalogados.`);

  const stores = [];

  // Parse CHEDRAUI
  // New columns: A=Tienda, B=Centro, C=Cadena, D=Formato, E=Estado, F=%Part, G=Municipio, H=Localidad, I=Productos catalogados, J=Direccion, K=Lat, L=Long, M=Estado(corrección)
  if (workbook.Sheets['CHEDRAUI']) {
    const chedData = XLSX.utils.sheet_to_json(workbook.Sheets['CHEDRAUI'], { header: 'A' });
    chedData.slice(1).forEach((row, i) => {
      if (!row['A']) return;

      const latRaw = row['K'];
      const lngRaw = row['L'];

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
      
      const storeCode = row['A']?.toString()?.trim();
      const catalogProducts = catalogByStore[storeCode] || [];

      stores.push({
        id: `ched-${i}`,
        source_sheet: 'CHEDRAUI',
        chain: normalizeChain(row['C']?.toString() || 'Chedraui'),
        store_code: storeCode,
        center_name: row['B']?.toString(),
        store_format: row['D']?.toString(),
        state_raw: row['E']?.toString(),
        state_normalized: row['E']?.toString().toUpperCase().trim(),
        municipality: row['G']?.toString() || null,
        locality: row['H']?.toString() || null,
        address_raw: row['J']?.toString() || null,
        latitude: isValidCoords ? lat : null,
        longitude: isValidCoords ? lng : null,
        latitude_raw: latRaw?.toString() || null,
        longitude_raw: lngRaw?.toString() || null,
        coord_status: row['M']?.toString() || null,
        participation_percentage: row['F'],
        cataloged_products_count: parseInt(row['I'], 10) || 0,
        catalog_products: catalogProducts,
        needs_geocoding: !isValidCoords,
        needs_review: needsReview,
        data_quality_notes: notes.join(' | ') || null,
      });
    });
  }

  // Parse LA COMER
  // Columns: A=Tienda, B=Centro, C=Formato, D=Estado, E=%Part, F=Productos catalogados, G=Direccion, H=Latitud, I=Longitud
  if (workbook.Sheets['LA COMER']) {
    const comerData = XLSX.utils.sheet_to_json(workbook.Sheets['LA COMER'], { header: 'A' });
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
      
      const storeCode = row['A']?.toString()?.trim();
      const catalogProducts = catalogByStore[storeCode] || [];

      stores.push({
        id: `comer-${i}`,
        source_sheet: 'LA COMER',
        chain: 'La Comer',
        store_code: storeCode,
        center_name: row['B']?.toString(),
        store_format: row['C']?.toString(),
        state_raw: row['D']?.toString(),
        state_normalized: row['D']?.toString().toUpperCase().trim(),
        municipality: null,
        locality: null,
        address_raw: row['G']?.toString() || null,
        latitude: isValidCoords ? lat : null,
        longitude: isValidCoords ? lng : null,
        latitude_raw: latRaw?.toString() || null,
        longitude_raw: lngRaw?.toString() || null,
        coord_status: null,
        participation_percentage: row['E'],
        cataloged_products_count: parseInt(row['F'], 10) || 0,
        catalog_products: catalogProducts,
        needs_geocoding: !isValidCoords,
        needs_review: needsReview,
        data_quality_notes: notes.join(' | ') || null,
      });
    });
  }

  console.log(`Procesadas ${stores.length} tiendas.`);

  // Stats
  const withCatalog = stores.filter(s => s.catalog_products.length > 0).length;
  const withoutCatalog = stores.filter(s => s.catalog_products.length === 0).length;
  const withCoords = stores.filter(s => s.latitude !== null).length;
  const needsGeo = stores.filter(s => s.needs_geocoding).length;
  console.log(`  - Con catálogo join: ${withCatalog}`);
  console.log(`  - Sin catálogo join: ${withoutCatalog}`);
  console.log(`  - Con coordenadas: ${withCoords}`);
  console.log(`  - Necesitan geocoding: ${needsGeo}`);

  // Guardar archivo
  if (!fs.existsSync(path.dirname(outputMockPath))) {
    fs.mkdirSync(path.dirname(outputMockPath), { recursive: true });
  }

  const fileContent = `export const mockStores = ${JSON.stringify(stores, null, 2)};\n`;
  fs.writeFileSync(outputMockPath, fileContent, 'utf-8');
  console.log('Mock generado en:', outputMockPath);
}

parseExcel();
