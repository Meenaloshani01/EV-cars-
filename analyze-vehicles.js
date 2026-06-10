import fs from 'fs';
import path from 'path';

// Read the dataset
const dataPath = path.join('.', 'data', 'fleet-dataset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Group by vehicle_id and count
const vehicleStats = {};

data.forEach(record => {
  const vehicleId = record.vehicle_id;
  if (!vehicleStats[vehicleId]) {
    vehicleStats[vehicleId] = {
      vehicle_id: vehicleId,
      car_type: record.car_type,
      admin_id: record.admin_id,
      trip_count: 0,
      total_distance_km: 0,
      total_income: 0,
      avg_battery_health: 0
    };
  }
  vehicleStats[vehicleId].trip_count++;
  vehicleStats[vehicleId].total_distance_km += record.distance_travelled_km || 0;
  vehicleStats[vehicleId].total_income += record.trip_income || 0;
  vehicleStats[vehicleId].avg_battery_health += record.battery_health_pct || 0;
});

// Calculate averages
Object.keys(vehicleStats).forEach(vehicleId => {
  const stats = vehicleStats[vehicleId];
  stats.avg_battery_health = (stats.avg_battery_health / stats.trip_count).toFixed(2);
});

// Convert to array and sort by trip count
const vehicleArray = Object.values(vehicleStats).sort((a, b) => b.trip_count - a.trip_count);

console.log('\n=== ACTIVE VEHICLES SUMMARY ===\n');
console.log(`Total Active Vehicles: ${vehicleArray.length}\n`);

console.log('Top 20 Active Vehicles:');
console.log('Vehicle ID | Car Type | Trips | Distance (km) | Total Income | Avg Battery Health');
console.log('-'.repeat(90));

vehicleArray.slice(0, 20).forEach(vehicle => {
  console.log(
    `${vehicle.vehicle_id.padEnd(10)} | ${vehicle.car_type.padEnd(20)} | ${String(vehicle.trip_count).padEnd(5)} | ${vehicle.total_distance_km.toFixed(2).padEnd(13)} | ${vehicle.total_income.toFixed(2).padEnd(12)} | ${vehicle.avg_battery_health}%`
  );
});

// Summary statistics
const tripCounts = vehicleArray.map(v => v.trip_count);
const avgTripsPerVehicle = (tripCounts.reduce((a, b) => a + b, 0) / tripCounts.length).toFixed(2);
const maxTrips = Math.max(...tripCounts);
const minTrips = Math.min(...tripCounts);

console.log('\n=== VEHICLE STATISTICS ===\n');
console.log(`Average Trips per Vehicle: ${avgTripsPerVehicle}`);
console.log(`Max Trips by a Vehicle: ${maxTrips}`);
console.log(`Min Trips by a Vehicle: ${minTrips}`);

// Save detailed report
const reportPath = path.join('.', 'data', 'vehicle-summary.json');
fs.writeFileSync(reportPath, JSON.stringify({
  total_active_vehicles: vehicleArray.length,
  summary_stats: {
    avg_trips_per_vehicle: parseFloat(avgTripsPerVehicle),
    max_trips: maxTrips,
    min_trips: minTrips,
    total_trips: data.length
  },
  vehicle_details: vehicleArray
}, null, 2));

console.log(`\nDetailed report saved to: data/vehicle-summary.json`);
