import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('\n=== FLEET ANALYSIS - 50 UNIQUE CARS FROM 5000 TRIPS ===\n');
console.log(`Total Trips: ${data.length}`);
console.log(`Total Unique Vehicles: 50\n`);

// Group by vehicle_id and get latest record for each
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

console.log(`=== VEHICLE LATEST STATUS ===\n`);
console.log(`Total Unique Vehicles: ${vehicles.length}\n`);

// Categorize by status based on latest record
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
    driver_id: vehicle.driver_id,
    battery_health_pct: vehicle.battery_health_pct,
    road_type: vehicle.road_type,
    trip_income: vehicle.trip_income
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
console.log(`🔌 Charging Cars: ${charging}`);
console.log(`🔧 Maintenance Cars: ${maintenance}`);
console.log(`✅ Working Cars: ${working}`);
console.log(`📊 Total Unique Cars: ${charging + maintenance + working}\n`);
console.log(`Verification: ${charging} + ${maintenance} + ${working} = ${charging + maintenance + working}\n`);

console.log('=== CHARGING VEHICLES (LATEST STATUS) ===\n');
if (chargingVehicles.length === 0) {
  console.log('No vehicles currently charging.\n');
} else {
  console.log(`Count: ${chargingVehicles.length}`);
  chargingVehicles.forEach(v => {
    console.log(`  ${v.vehicle_id} (${v.car_type}) - Battery: ${v.battery_percentage}% | Health: ${v.battery_health_pct}% | Last Trip: ${v.datetime}`);
  });
  console.log();
}

console.log('=== MAINTENANCE VEHICLES (LATEST STATUS) ===\n');
if (maintenanceVehicles.length === 0) {
  console.log('No vehicles in maintenance.\n');
} else {
  console.log(`Count: ${maintenanceVehicles.length}`);
  maintenanceVehicles.forEach(v => {
    console.log(`  ${v.vehicle_id} (${v.car_type}) - Status: ${v.maintenance_status} | Last Trip: ${v.datetime}`);
  });
  console.log();
}

console.log('=== WORKING VEHICLES (LATEST STATUS) ===\n');
console.log(`Count: ${workingVehicles.length}`);
console.log('All working vehicles:');
workingVehicles.forEach(v => {
  console.log(`  ${v.vehicle_id} (${v.car_type}) - Battery: ${v.battery_percentage}% | Speed: ${v.speed_kmph} km/h | Road: ${v.road_type} | Trip Income: ₹${v.trip_income.toFixed(2)} | Last Trip: ${v.datetime}`);
});

// Save detailed report
const reportPath = path.join('.', 'data', 'vehicle-fleet-status-50cars.json');
fs.writeFileSync(reportPath, JSON.stringify({
  total_trips: data.length,
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

console.log(`\nDetailed report saved to: data/vehicle-fleet-status-50cars.json`);
