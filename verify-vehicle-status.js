import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get unique vehicles (one record per vehicle)
const uniqueVehicles = {};

data.forEach(record => {
  const vehicleId = record.vehicle_id;
  if (!uniqueVehicles[vehicleId]) {
    uniqueVehicles[vehicleId] = record;
  }
});

const vehicles = Object.values(uniqueVehicles);

console.log('\n=== UNIQUE VEHICLE STATUS ===\n');
console.log(`Total unique vehicles: ${vehicles.length}\n`);

// Count by charging status
const chargingVehicles = vehicles.filter(v => v.charging_status === 'Charging');
const notChargingVehicles = vehicles.filter(v => v.charging_status === 'Not Charging');

console.log('By Charging Status:');
console.log(`  Charging: ${chargingVehicles.length} vehicles`);
console.log(`  Not Charging: ${notChargingVehicles.length} vehicles\n`);

// Count by maintenance status
const maintenanceVehicles = vehicles.filter(v => v.maintenance_status === 'Completed');
const noneMaintenanceVehicles = vehicles.filter(v => v.maintenance_status === 'None');

console.log('By Maintenance Status:');
console.log(`  Completed: ${maintenanceVehicles.length} vehicles`);
console.log(`  None: ${noneMaintenanceVehicles.length} vehicles\n`);

// Combined status
console.log('Combined Status:');
let charging = 0, maintenance = 0, working = 0;

vehicles.forEach(v => {
  if (v.charging_status === 'Charging') {
    charging++;
  } else if (v.maintenance_status === 'Completed') {
    maintenance++;
  } else {
    working++;
  }
});

console.log(`  Charging: ${charging}`);
console.log(`  Maintenance (Completed): ${maintenance}`);
console.log(`  Working: ${working}`);
console.log(`  Total: ${charging + maintenance + working}\n`);

// Show charging vehicles
console.log('=== CHARGING VEHICLES ===\n');
chargingVehicles.forEach(v => {
  console.log(`${v.vehicle_id}: ${v.car_type} (Battery: ${v.battery_percentage}%) - Charging: ${v.charging_status}, Maintenance: ${v.maintenance_status}`);
});

// Show maintenance vehicles
console.log('\n=== MAINTENANCE VEHICLES ===\n');
if (maintenanceVehicles.length === 0) {
  console.log('No vehicles in maintenance.');
} else {
  maintenanceVehicles.forEach(v => {
    console.log(`${v.vehicle_id}: ${v.car_type} - Maintenance: ${v.maintenance_status}`);
  });
}
