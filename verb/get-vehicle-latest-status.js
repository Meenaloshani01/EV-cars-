import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Group by vehicle_id and get the latest record for each
const vehicleLatestStatus = {};

data.forEach(record => {
  const vehicleId = record.vehicle_id;
  
  if (!vehicleLatestStatus[vehicleId]) {
    vehicleLatestStatus[vehicleId] = record;
  } else {
    // Compare timestamps and keep the latest one
    const currentTime = new Date(vehicleLatestStatus[vehicleId].datetime).getTime();
    const newTime = new Date(record.datetime).getTime();
    
    if (newTime > currentTime) {
      vehicleLatestStatus[vehicleId] = record;
    }
  }
});

const vehicles = Object.values(vehicleLatestStatus);

console.log('\n=== VEHICLE STATUS BY LATEST RECORD ===\n');
console.log(`Total Unique Vehicles: ${vehicles.length}\n`);

// Categorize by status
let charging = 0;
let maintenance = 0;
let working = 0;

const chargingVehicles = [];
const maintenanceVehicles = [];
const workingVehicles = [];

vehicles.forEach(vehicle => {
  const statusRecord = {
    vehicle_id: vehicle.vehicle_id,
    car_type: vehicle.car_type,
    battery_percentage: vehicle.battery_percentage,
    charging_status: vehicle.charging_status,
    maintenance_status: vehicle.maintenance_status,
    speed_kmph: vehicle.speed_kmph,
    datetime: vehicle.datetime,
    admin_id: vehicle.admin_id,
    driver_id: vehicle.driver_id
  };

  if (vehicle.charging_status === 'Charging') {
    charging++;
    chargingVehicles.push(statusRecord);
  } else if (vehicle.maintenance_status === 'Completed') {
    maintenance++;
    maintenanceVehicles.push(statusRecord);
  } else {
    working++;
    workingVehicles.push(statusRecord);
  }
});

console.log('=== FLEET STATUS SUMMARY ===\n');
console.log(`Charging Cars: ${charging}`);
console.log(`Maintenance Cars (Completed): ${maintenance}`);
console.log(`Working Cars: ${working}`);
console.log(`Total: ${charging + maintenance + working}\n`);
console.log(`Verification: ${charging} + ${maintenance} + ${working} = ${charging + maintenance + working}\n`);

console.log('=== CHARGING VEHICLES ===\n');
if (chargingVehicles.length === 0) {
  console.log('No vehicles currently charging.\n');
} else {
  console.log(`Count: ${chargingVehicles.length}`);
  chargingVehicles.forEach(v => {
    console.log(`  ${v.vehicle_id} (${v.car_type}) - Battery: ${v.battery_percentage}% | Last Update: ${v.datetime}`);
  });
  console.log();
}

console.log('=== MAINTENANCE VEHICLES ===\n');
if (maintenanceVehicles.length === 0) {
  console.log('No vehicles in maintenance.\n');
} else {
  console.log(`Count: ${maintenanceVehicles.length}`);
  maintenanceVehicles.forEach(v => {
    console.log(`  ${v.vehicle_id} (${v.car_type}) - Status: ${v.maintenance_status} | Last Update: ${v.datetime}`);
  });
  console.log();
}

console.log('=== WORKING VEHICLES ===\n');
console.log(`Count: ${workingVehicles.length}`);
console.log('Sample (first 10):');
workingVehicles.slice(0, 10).forEach(v => {
  console.log(`  ${v.vehicle_id} (${v.car_type}) - Speed: ${v.speed_kmph} km/h | Battery: ${v.battery_percentage}% | Last Update: ${v.datetime}`);
});

// Save detailed report
const reportPath = path.join('.', 'data', 'vehicle-latest-status.json');
fs.writeFileSync(reportPath, JSON.stringify({
  total_unique_vehicles: vehicles.length,
  status_summary: {
    charging: charging,
    maintenance: maintenance,
    working: working,
    total: charging + maintenance + working
  },
  charging_vehicles: chargingVehicles,
  maintenance_vehicles: maintenanceVehicles,
  working_vehicles: workingVehicles,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\nDetailed report saved to: data/vehicle-latest-status.json`);
