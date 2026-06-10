import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Read the Excel file
const filePath = 'C:\\Users\\HP\\Desktop\\EV_Fleet_City_Highway_5000 (2) (1).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`Total records: ${data.length}`);
console.log('Sample record:', data[0]);
console.log('Column names:', Object.keys(data[0]));

// Save to JSON file
const outputPath = path.join('.', 'data', 'fleet-dataset.json');
const dataDir = path.dirname(outputPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`\nDataset saved to ${outputPath}`);
