import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Rutas de los archivos fuente ──────────────────────────────
const tiendasXlsxPath  = path.resolve(__dirname, '../../tiendas_coordenadas_google_maps.xlsx');
const geojsonPath      = path.resolve(__dirname, '../../tiendas_coordenadas_google_maps.geojson');
const catalogoPath     = path.resolve(__dirname, '../../260605_Hoja de catálogo_La Comer_Augusto.xlsx');
const beerPath         = path.resolve(__dirname, '../data/Cards_Beers.xlsx');
const outputMockPath   = path.resolve(__dirname, '../data/mockStores.js');

// ── Normalizar nombre de cadena ───────────────────────────────
function normalizeChain(raw) {
  if (!raw) return raw;
  const upper = raw.toString().toUpperCase().trim();
  if (upper === 'LA COMER' || upper === 'LACOMER') return 'La Comer';
  if (upper === 'CHEDRAUI') return 'Chedraui';
  return raw.toString().trim();
}

function buildData() {
  // ── 0. Leer características de cervezas (Cards_Beers.xlsx) ────
  console.log('Leyendo características de cervezas:', beerPath);
  const bufBeer = fs.readFileSync(beerPath);
  const wbBeer = XLSX.read(bufBeer, { type: 'buffer' });
  const sheetBeer = wbBeer.Sheets[wbBeer.SheetNames[0]];
  const beerRows = XLSX.utils.sheet_to_json(sheetBeer);
  
  const cleanStr = (val) => {
    if (val === undefined || val === null) return null;
    const s = val.toString().trim();
    return s === '?' ? null : s;
  };

  const beerMap = {};
  beerRows.forEach(b => {
    const id = b.ID?.toString()?.trim();
    if (id) {
      beerMap[id] = {
        id: id,
        name: cleanStr(b.Nombre),
        title: cleanStr(b.Titulo),
        text: cleanStr(b.Texto),
        abv: (b.ABV !== undefined && b.ABV !== '?' && !isNaN(parseFloat(b.ABV))) ? parseFloat(b.ABV) : null,
        ml: (b.ML !== undefined && b.ML !== '?' && !isNaN(parseInt(b.ML, 10))) ? parseInt(b.ML, 10) : null,
        img: cleanStr(b.IMG),
      };
    }
  });
  console.log(`  → ${Object.keys(beerMap).length} cervezas leídas`);

  // ── 1. Leer catálogo de productos (join por Tienda) ───────────
  console.log('Leyendo catálogo de productos:', catalogoPath);
  const bufCat = fs.readFileSync(catalogoPath);
  const wbCat  = XLSX.read(bufCat, { type: 'buffer' });

  const catalogByStore = {};
  const sheetCat = wbCat.Sheets['Horizontal'];
  if (sheetCat) {
    const catData = XLSX.utils.sheet_to_json(sheetCat);
    catData.forEach(row => {
      const tienda = row['Tienda']?.toString()?.trim();
      if (!tienda) return;
      if (!catalogByStore[tienda]) catalogByStore[tienda] = [];

      for (let i = 1; i <= 11; i++) {
        const upc = row[`UPC ${i}`]?.toString()?.trim();
        const description = row[`Descripción ${i}`]?.toString()?.trim();
        if (upc) {
          const beerDetails = beerMap[upc] || null;
          catalogByStore[tienda].push({
            upc: upc,
            description: description || (beerDetails ? beerDetails.name : null),
            beer_details: beerDetails
          });
        }
      }
    });
  }
  console.log(`  → ${Object.keys(catalogByStore).length} tiendas con productos en catálogo`);

  // ── 2. Leer GeoJSON (join por Tienda → geometría) ─────────────
  console.log('Leyendo GeoJSON:', geojsonPath);
  const rawGeo   = fs.readFileSync(geojsonPath, 'utf-8');
  const geojson  = JSON.parse(rawGeo);
  const geoByStore = {};
  (geojson.features || []).forEach(feat => {
    const tienda = feat.properties?.Tienda?.toString()?.trim();
    if (!tienda) return;
    // Guardar coordenadas del GeoJSON (geometry.coordinates = [lon, lat])
    const [lon, lat] = feat.geometry?.coordinates || [];
    geoByStore[tienda] = { lat, lon, url: feat.properties?.URL || null };
  });
  console.log(`  → ${Object.keys(geoByStore).length} tiendas con coordenadas en GeoJSON`);

  // ── 3. Leer XLSX de tiendas (fuente principal) ────────────────
  console.log('Leyendo tiendas XLSX:', tiendasXlsxPath);
  const bufT = fs.readFileSync(tiendasXlsxPath);
  const wbT  = XLSX.read(bufT, { type: 'buffer' });

  // Hoja "Tiendas":
  // A=id, B=Tienda, C=Centro, D=Cadena, E=Formato, F=Estado,
  // G=Municipio, H=Localidad, I=Productos catalogados, J=% Part, K=lon, L=lat, M=coord_geojson, N=URL
  const sheet = wbT.Sheets['Tiendas'];
  if (!sheet) {
    console.error('ERROR: No se encontró la hoja "Tiendas" en el XLSX.');
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A' });
  const stores = [];

  rows.slice(1).forEach((row, i) => {
    const tiendaKey = row['B']?.toString()?.trim();
    if (!tiendaKey) return;

    // Coordenadas: prioridad XLSX → GeoJSON fallback
    let lat = parseFloat(row['L']);
    let lon = parseFloat(row['K']);

    // Fallback a GeoJSON si el XLSX no tiene coords válidas
    if ((isNaN(lat) || lat === 0) && geoByStore[tiendaKey]) {
      lat = geoByStore[tiendaKey].lat;
      lon = geoByStore[tiendaKey].lon;
    }

    const isValidCoords = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;

    // % Part: limpiar string "1.4%" → número
    const partRaw = row['J']?.toString()?.replace('%', '').trim();
    const partNum = parseFloat(partRaw) / 100 || 0;

    // Productos catalogados del catálogo XLSX (join)
    const catalogProducts = catalogByStore[tiendaKey] || [];

    // URL: preferir GeoJSON si no está en XLSX
    const storeUrl = row['N']?.toString() || geoByStore[tiendaKey]?.url || null;

    stores.push({
      id:                      `store-${i}`,
      source_sheet:            'tiendas_coordenadas_google_maps',
      chain:                   normalizeChain(row['D']?.toString()),
      store_code:              tiendaKey,
      center_name:             row['C']?.toString()?.trim() || null,
      store_format:            row['E']?.toString()?.trim() || null,
      state_raw:               row['F']?.toString()?.trim() || null,
      state_normalized:        row['F']?.toString()?.toUpperCase()?.trim() || null,
      municipality:            row['G']?.toString()?.trim() || null,
      locality:                row['H']?.toString()?.trim() || null,
      address_raw:             storeUrl,
      latitude:                isValidCoords ? lat : null,
      longitude:               isValidCoords ? lon : null,
      latitude_raw:            row['L']?.toString() || null,
      longitude_raw:           row['K']?.toString() || null,
      coord_status:            isValidCoords ? 'Google Maps' : 'Sin coordenadas',
      participation_percentage: partNum,
      cataloged_products_count: parseInt(row['I'], 10) || catalogProducts.length,
      catalog_products:        catalogProducts,
      needs_geocoding:         !isValidCoords,
      needs_review:            false,
      data_quality_notes:      null,
    });
  });

  console.log(`\nResumen:`);
  console.log(`  → ${stores.length} tiendas procesadas`);
  console.log(`  → Con coordenadas: ${stores.filter(s => s.latitude !== null).length}`);
  console.log(`  → Sin coordenadas: ${stores.filter(s => s.latitude === null).length}`);
  console.log(`  → Con catálogo: ${stores.filter(s => s.catalog_products.length > 0).length}`);
  console.log(`  → Sin catálogo: ${stores.filter(s => s.catalog_products.length === 0).length}`);

  // Estadísticas de join con GeoJSON
  const matchedGeo = stores.filter(s => geoByStore[s.store_code]).length;
  console.log(`  → Match con GeoJSON: ${matchedGeo}/${stores.length} tiendas`);

  // ── 4. Guardar mockStores.js ──────────────────────────────────
  if (!fs.existsSync(path.dirname(outputMockPath))) {
    fs.mkdirSync(path.dirname(outputMockPath), { recursive: true });
  }
  const fileContent = `export const mockStores = ${JSON.stringify(stores, null, 2)};\n`;
  fs.writeFileSync(outputMockPath, fileContent, 'utf-8');
  console.log('\n✅ Mock generado en:', outputMockPath);
}

buildData();
