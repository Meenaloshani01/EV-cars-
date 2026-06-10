import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('\n=== FLEET ANALYSIS - 5000 RECORDS ===\n');
console.log(`Total Records in Dataset: ${data.length}\n`);

// Count by charging status
const chargingCount = data.filter(d => d.charging_status === 'Charging').length;
const notChargingCount = data.filter(d => d.charging_status === 'Not Charging').length;

console.log('=== CHARGING STATUS (All 5000 Records) ===\n');
console.log(`Charging: ${chargingCount} records (${(chargingCount/data.length*100).toFixed(2)}%)`);
console.log(`Not Charging: ${notChargingCount} records (${(notChargingCount/data.length*100).toFixed(2)}%)\n`);

// Count by maintenance status
const maintenanceCount = data.filter(d => d.maintenance_status === 'Completed').length;
const noneMaintenanceCount = data.filter(d => d.maintenance_status === 'None').length;

console.log('=== MAINTENANCE STATUS (All 5000 Records) ===\n');
console.log(`Completed: ${maintenanceCount} records (${(maintenanceCount/data.length*100).toFixed(2)}%)`);
console.log(`None: ${noneMaintenanceCount} records (${(noneMaintenanceCount/data.length*100).toFixed(2)}%)\n`);

// Combined status
let charging = 0;
let maintenance = 0;
let working = 0;

data.forEach(record => {
  if (record.charging_status === 'Charging') {
    charging++;
  } else if (record.maintenance_status === 'Completed') {
    maintenance++;
  } else {
    working++;
  }
});

console.log('=== COMBINED STATUS (All 5000 Records) ===\n');
console.log(`Charging Cars: ${charging}`);
console.log(`Maintenance Cars: ${maintenance}`);
console.log(`Working Cars: ${working}`);
console.log(`Total: ${charging + maintenance + working}\n`);
console.log(`Verification: ${charging} + ${maintenance} + ${working} = ${charging + maintenance + working}\n`);

// Unique vehicles analysis
const uniqueVehicles = new Set(data.map(d => d.vehicle_id));
console.log('=== UNIQUE VEHICLES ===\n');
console.log(`Total Unique Vehicles: ${uniqueVehicles.size}`);
console.log(`Average Records per Vehicle: ${(data.length / uniqueVehicles.size).toFixed(2)}\n`);

// Save comprehensive report
const reportPath = path.join('.', 'data', 'fleet-5000-records-analysis.json');
fs.writeFileSync(reportPath, JSON.stringify({
  total_records: data.length,
  unique_vehicles: uniqueVehicles.size,
  records_per_vehicle_avg: (data.length / uniqueVehicles.size).toFixed(2),
  charging_status: {
    charging: charging,
    not_charging: working + maintenance,
    total: data.length,
    charging_percentage: (charging / data.length * 100).toFixed(2)
  },
  maintenance_status: {
    completed: maintenance,
    none: working + charging,
    total: data.length
  },
  combined_status: {
    charging: charging,
    maintenance: maintenance,
    working: working,
    total: charging + maintenance + working
  },
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`Report saved to: data/fleet-5000-records-analysis.json`);
