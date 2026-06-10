import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get unique values for categorical columns
const chargingStatusValues = new Set();
const maintenanceStatusValues = new Set();

data.forEach(record => {
  if (record.charging_status) {
    chargingStatusValues.add(record.charging_status);
  }
  if (record.maintenance_status) {
    maintenanceStatusValues.add(record.maintenance_status);
  }
});

console.log('\n=== CHARGING STATUS VALUES ===\n');
console.log('Unique charging_status values:');
chargingStatusValues.forEach(val => {
  const count = data.filter(d => d.charging_status === val).length;
  console.log(`  "${val}": ${count} records`);
});

console.log('\n=== MAINTENANCE STATUS VALUES ===\n');
console.log('Unique maintenance_status values:');
maintenanceStatusValues.forEach(val => {
  const count = data.filter(d => d.maintenance_status === val).length;
  console.log(`  "${val}": ${count} records`);
});

console.log('\n=== SAMPLE RECORDS ===\n');
console.log('First 5 records with their status columns:');
data.slice(0, 5).forEach((record, i) => {
  console.log(`Record ${i + 1}:`);
  console.log(`  vehicle_id: ${record.vehicle_id}`);
  console.log(`  charging_status: "${record.charging_status}"`);
  console.log(`  maintenance_status: "${record.maintenance_status}"`);
  console.log(`  battery_percentage: ${record.battery_percentage}%`);
});
