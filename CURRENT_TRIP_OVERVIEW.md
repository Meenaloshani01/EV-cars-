# 🚗 Current Trip Page - Driver Dashboard

## Overview

The Current Trip page allows drivers to start and monitor their active trips in real-time with live telemetry, battery tracking, and safety alerts.

## 📋 Two States

### State 1: Trip Initialization (No Active Trip)

When the driver navigates to the "Current Trip" page without an active trip, they see a form to start a new trip.

**Form Fields:**
1. **Odometer Reading (km)** - Total distance traveled by the vehicle
2. **Current Battery Percentage (%)** - Must be between 10-100%
3. **Car Type** - Select from:
   - Hyundai Kona EV
   - Tata Nexon EV
   - MG ZS EV
   - Kia EV6
   - Other
4. **Driving Mode** - Radio buttons:
   - City Driving (higher efficiency: 6.5 km/1% battery)
   - Highway Driving (lower efficiency: 4.8 km/1% battery)

**Action Button:**
- ⚡ Start Trip - Begins the trip simulation

---

### State 2: Active Trip (Real-time Monitoring)

Once the trip starts, the page displays live telemetry and trip information.

## 📊 Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Current Trip (Live)                       │
├──────────────────────────┬──────────────────────────────────┤
│  Live Telemetry          │  Trip Estimations & Alerts       │
│  ┌──────────────────┐    │                                  │
│  │   Speed Circle   │    │  • Car Type                      │
│  │     (km/h)       │    │  • Driving Mode                  │
│  └──────────────────┘    │  • Remaining Range               │
│                          │  • Energy Consumption            │
│  • Distance Covered      │  • Battery Status                │
│  • Odometer              │  • Charging Recommendation       │
│  • Battery Percentage    │  • Maintenance Alerts            │
│  • Battery Bar           │                                  │
│                          │  [End Trip Button]               │
├──────────────────────────┴──────────────────────────────────┤
│                   Speed Trend Chart                          │
│  (Real-time sparkline showing speed over time)               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Features

### Left Panel: Live Telemetry

**1. Speed Indicator**
   - Circular progress indicator
   - Shows current speed in km/h
   - Updates every 1.5 seconds
   - Color: Cyan

**2. Trip Metrics**
   - **Distance Covered**: Shows km traveled since trip start
   - **Odometer**: Total vehicle kilometers (initial + distance)
   - **Battery Percentage**: Real-time battery level
   - **Battery Bar**: Visual progress bar

### Right Panel: Trip Estimations & Alerts

**1. Trip Information**
   - **Car Type**: Selected vehicle model
   - **Driving Mode**: City or Highway (color: cyan)
   - **Remaining Range**: Calculated based on battery & efficiency
   - **Energy Consumption**: 
     - City: 14.5 kWh/100 km
     - Highway: 18.2 kWh/100 km

**2. Battery Status** (Color-coded)
   - **Healthy** (>70%) - Green
   - **Medium** (30-70%) - Amber
   - **Low** (<30%) - Red

**3. Charging Recommendation**
   - **Battery > 30%**: "✓ Sufficient Battery: Smart charging suggested at off-peak hours"
   - **Battery < 30%**: "⚠️ Low Battery: Recommend immediate charging"

**4. Maintenance Alerts** (Based on odometer)
   - **< 50,000 km**: "✓ Vehicle status healthy. No alerts." (Green)
   - **50,000-100,000 km**: "🔧 Rotation of tires and brake check recommended" (Amber)
   - **> 100,000 km**: "⚠️ Full mechanical check recommended" (Red)

**5. End Trip Button**
   - Red button to stop trip simulation
   - Resets to State 1 (form view)

### Bottom Panel: Speed Trend Chart

- **Real-time sparkline graph** showing speed variations
- Displays last 30 speed readings
- Interactive with tooltips
- Grid lines with speed values
- Timeline labels (Start → Now)

## 🔄 Real-time Updates

### Update Interval: Every 1.5 seconds

**What Updates:**
1. **Speed**: Random variation (-10 to +10 km/h)
2. **Distance**: Incremented based on speed
3. **Odometer**: Initial + distance covered
4. **Battery**: Decreases based on:
   - Distance traveled
   - Energy consumption rate (city/highway)
   - Battery capacity
5. **Range**: Recalculated (battery % × efficiency)
6. **Speed Chart**: New data point added (max 30 points)

### Battery Calculation Logic

```javascript
// City: 14.5 kWh/100km, Highway: 18.2 kWh/100km
const rate = mode === 'City' ? 14.5 : 18.2;
const kwhUsed = distance * (rate / 100);
const batteryUsed = (kwhUsed / capacity) * 100;
const currentBattery = initialBattery - batteryUsed;
```

### Range Calculation Logic

```javascript
// City: 6.5 km/1%, Highway: 4.8 km/1%
const efficiency = mode === 'City' ? 6.5 : 4.8;
const remainingRange = currentBattery * efficiency;
```

## 🎨 UI Elements

### Color Scheme

- **Cyan** (#00e7ff): Speed indicator, driving mode, recommendations
- **Green** (#00ffa3): Healthy status
- **Amber** (#ffb22b): Warning status
- **Red** (#ff4444): Critical alerts, danger button

### Status Pills

- **Healthy**: Green background, battery > 70%
- **Medium**: Amber background, battery 30-70%
- **Low**: Red background, battery < 30%

### Animations

- **Pulse effect** on "Live Telemetry" heading
- **Smooth transitions** on battery bar
- **Real-time speed chart** updates with glow effect

## 📱 Responsive Design

- **Glass morphism** design with blur effects
- **Grid layout** adapts to screen size
- **Form fields** stack on mobile
- **Charts** resize automatically

## 🔧 Technical Details

### State Management

```javascript
window._activeTrip = {
  odometer: 24500,        // Initial odometer reading
  battery: 80,            // Initial battery %
  carType: "Tata Nexon EV",
  drivingMode: "City",    // "City" or "Highway"
  distance: 0,            // Distance covered
  initialBattery: 80      // Starting battery %
}
```

### Event Handling

1. **Form Submit**: Creates `_activeTrip` object, re-renders page
2. **End Trip Button**: Clears `_activeTrip`, returns to form
3. **Hash Change**: Cleans up interval timer
4. **Automatic Updates**: setInterval at 1500ms

### Cleanup

```javascript
// Timer cleanup on page navigation
window.addEventListener('hashchange', () => {
  clearInterval(timer);
  delete window.endTrip;
}, { once: true });
```

## 🎯 Use Cases

### 1. Driver Starting a Trip
1. Navigate to "Current Trip"
2. Fill in odometer reading
3. Enter current battery percentage
4. Select car type
5. Choose driving mode (City/Highway)
6. Click "Start Trip"

### 2. Monitoring Trip Progress
- View real-time speed
- Track distance covered
- Monitor battery depletion
- Check remaining range
- Get charging recommendations
- Receive maintenance alerts

### 3. Ending a Trip
- Click "End Trip" button
- View trip summary (future feature)
- Return to trip initialization form

## 🚀 Future Enhancements

### Potential Features:
1. **ML Integration**: Use ML model to predict range more accurately
2. **Trip History**: Save completed trips
3. **Route Mapping**: Show trip route on map
4. **Cost Calculation**: Calculate trip cost based on distance
5. **Weather Integration**: Adjust predictions based on weather
6. **Traffic Data**: Factor in traffic conditions
7. **Trip Summary**: Show detailed summary on trip end
8. **Export Data**: Download trip data as CSV/PDF
9. **Comparison**: Compare trips (city vs highway efficiency)
10. **Alerts**: Push notifications for low battery

## 💡 Integration with ML Model

### How to Add ML Predictions:

```javascript
import { predictRange } from './ml-service.js';

// In the update function, replace range calculation with ML:
const mlResult = await predictRange({
  car_type: window._activeTrip.carType,
  battery_percentage: currentBatt,
  road_type: mode, // "City" or "Highway"
  speed_kmph: c.speed,
  total_km_run: currentOdo,
  passenger_count: 2, // Can be added to form
  charging_status: "Not Charging",
  maintenance_status: "None"
});

const mlRange = mlResult.predictedRange;
destsrange.textContent = mlRange + ' km';
```

### Benefits of ML Integration:
- More accurate range predictions
- Considers more factors (speed, weight, passengers)
- Learns from actual driving patterns
- Better recommendations

## 📊 Sample Trip Data

### City Trip Example:
- Initial Odometer: 24,500 km
- Initial Battery: 80%
- Distance Covered: 35 km
- Final Battery: ~75%
- Avg Speed: 45 km/h
- Energy Used: ~5 kWh

### Highway Trip Example:
- Initial Odometer: 45,000 km
- Initial Battery: 90%
- Distance Covered: 100 km
- Final Battery: ~68%
- Avg Speed: 85 km/h
- Energy Used: ~18 kWh

## 🎓 Key Learning Points

1. **Efficiency Difference**: City driving is ~35% more efficient than highway
2. **Battery Management**: Monitor battery levels for optimal charging
3. **Maintenance**: Regular checks based on odometer readings
4. **Speed Impact**: Higher speeds = higher energy consumption
5. **Range Anxiety**: Real-time range updates help with trip planning

---

**Access the Current Trip Page:**
- Driver Dashboard → Current Trip (📍)
- URL: `driver-dashboard.html#trip`

**Related Files:**
- `js/script.js` - Function: `driverTrip(root, car)`
- `driver-dashboard.html` - Driver dashboard layout
- `css/style.css` - Styling

---

*Built with real-time telemetry for VoltEdge EV Fleet Management* 🚗⚡
