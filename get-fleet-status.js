import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get unique vehicles by vehicle_id
const uniqueVehicles = {};

data.forEach(record => {
  const vehicleId = record.vehicle_id;
  if (!uniqueVehicles[vehicleId]) {
    uniqueVehicles[vehicleId] = record;
  }
});

const vehicles = Object.values(uniqueVehicles);

// Calculate statistics based on categorical values
let charging = 0;
let maintenance = 0;
let working = 0;

vehicles.forEach(vehicle => {
  const chargingStatus = vehicle.charging_status?.toLowerCase() || '';
  const maintenanceStatus = vehicle.maintenance_status?.toLowerCase() || '';
  
  if (chargingStatus === 'charging') {
    charging++;
  } else if (maintenanceStatus === 'completed') {
    maintenance++;
  } else {
    working++;
  }
});

const totalCars = vehicles.length;

const stats = {
  charging,
  maintenance,
  working,
  total: totalCars,
  timestamp: new Date().toISOString()
};

console.log('\n=== FLEET STATUS DASHBOARD ===\n');
console.log(`Charging Cars: ${charging}`);
console.log(`Maintenance Cars: ${maintenance}`);
console.log(`Working Cars: ${working}`);
console.log(`Total Cars: ${totalCars}`);
console.log(`\nVerification: ${charging} + ${maintenance} + ${working} = ${charging + maintenance + working}\n`);

// Save to JSON for dashboard
const statsPath = path.join('.', 'data', 'fleet-status.json');
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

console.log(`Status saved to: data/fleet-status.json`);
