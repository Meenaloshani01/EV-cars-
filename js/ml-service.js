/**
 * ML Prediction Service
 * Connects frontend to Flask ML API for range predictions
 */

const ML_API_BASE = 'http://localhost:5000/api';

/**
 * Check if ML API is available
 */
export async function checkMLHealth() {
  try {
    const response = await fetch(`${ML_API_BASE}/health`);
    const data = await response.json();
    return {
      available: true,
      modelLoaded: data.model_loaded,
      availableCars: data.available_cars
    };
  } catch (error) {
    console.warn('ML API not available:', error);
    return {
      available: false,
      modelLoaded: false,
      availableCars: []
    };
  }
}

/**
 * Predict remaining range for a single vehicle
 * @param {Object} vehicleData - Vehicle parameters
 * @returns {Promise<Object>} Prediction result
 */
export async function predictRange(vehicleData) {
  try {
    const response = await fetch(`${ML_API_BASE}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Prediction failed');
    }

    return {
      success: true,
      predictedRange: data.predicted_range_km,
      inputs: data.inputs,
      specs: data.car_specs
    };
  } catch (error) {
    console.error('ML Prediction Error:', error);
    return {
      success: false,
      error: error.message,
      predictedRange: null
    };
  }
}

/**
 * Predict range for multiple vehicles
 * @param {Array} vehicles - Array of vehicle data objects
 * @returns {Promise<Object>} Batch prediction results
 */
export async function predictBatchRange(vehicles) {
  try {
    const response = await fetch(`${ML_API_BASE}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vehicles })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Batch prediction failed');
    }

    return {
      success: true,
      count: data.count,
      predictions: data.predictions
    };
  } catch (error) {
    console.error('Batch Prediction Error:', error);
    return {
      success: false,
      error: error.message,
      predictions: []
    };
  }
}

/**
 * Get available car types from ML API
 * @returns {Promise<Array>} List of car types with specs
 */
export async function getCarTypes() {
  try {
    const response = await fetch(`${ML_API_BASE}/car-types`);
    const data = await response.json();
    return data.car_types || [];
  } catch (error) {
    console.error('Failed to fetch car types:', error);
    return [];
  }
}

/**
 * Convert app vehicle data to ML API format
 * @param {Object} vehicle - Vehicle object from app
 * @returns {Object} Formatted data for ML API
 */
export function formatVehicleForML(vehicle) {
  // Map charging boolean to status string
  let chargingStatus = 'Not Charging';
  if (vehicle.charging === true || vehicle.charging === 'Charging') {
    chargingStatus = 'Charging';
  }

  // Map maintenance status
  let maintenanceStatus = 'None';
  if (vehicle.maintenance_status) {
    maintenanceStatus = vehicle.maintenance_status;
  } else if (vehicle.condition < 30) {
    maintenanceStatus = 'Completed';
  } else if (vehicle.condition < 70) {
    maintenanceStatus = 'Low';
  }

  return {
    car_type: vehicle.brand || vehicle.car_type,
    battery_percentage: vehicle.battery || vehicle.battery_percentage,
    road_type: vehicle.roadType || 'City',
    speed_kmph: vehicle.speed || vehicle.speed_kmph || 0,
    total_km_run: vehicle.tripDistance || vehicle.total_km_run || 10000,
    passenger_count: vehicle.passengers || vehicle.passenger_count || 2,
    charging_status: chargingStatus,
    maintenance_status: maintenanceStatus
  };
}

/**
 * Update vehicle range using ML prediction
 * @param {Object} vehicle - Vehicle object to update
 * @returns {Promise<Object>} Updated vehicle with ML prediction
 */
export async function updateVehicleRangeML(vehicle) {
  const mlData = formatVehicleForML(vehicle);
  const prediction = await predictRange(mlData);

  if (prediction.success) {
    return {
      ...vehicle,
      range: Math.round(prediction.predictedRange),
      mlPredicted: true,
      mlConfidence: 'high'
    };
  } else {
    // Keep original range if prediction fails
    return {
      ...vehicle,
      mlPredicted: false,
      mlError: prediction.error
    };
  }
}

/**
 * Enhanced range prediction with fallback
 * Uses ML when available, falls back to formula-based calculation
 * @param {Object} vehicle - Vehicle data
 * @returns {Promise<number>} Predicted range in km
 */
export async function getPredictedRange(vehicle) {
  // Try ML prediction first
  const health = await checkMLHealth();
  
  if (health.available && health.modelLoaded) {
    const mlData = formatVehicleForML(vehicle);
    const prediction = await predictRange(mlData);
    
    if (prediction.success) {
      console.log(`🤖 ML Prediction: ${prediction.predictedRange} km`);
      return prediction.predictedRange;
    }
  }

  // Fallback to formula-based calculation
  console.log('📐 Using formula-based range calculation');
  return calculateRangeFormula(vehicle);
}

/**
 * Formula-based range calculation (fallback)
 * @param {Object} vehicle - Vehicle data
 * @returns {number} Estimated range in km
 */
function calculateRangeFormula(vehicle) {
  const cap = vehicle.batteryCapacity || 60;
  const pct = vehicle.battery || 80;
  const weight = vehicle.weight || 2000;
  const speed = vehicle.speed || 60;

  // Simple efficiency formula
  const baseRange = (cap * (pct / 100)) * 5.5;
  const weightPenalty = (weight - 1700) * 0.04;
  const speedPenalty = speed * 0.3;

  return Math.max(5, Math.round(baseRange - weightPenalty - speedPenalty));
}

/**
 * Display ML status in UI
 * @param {string} containerId - ID of container element
 */
export async function displayMLStatus(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const health = await checkMLHealth();

  const statusHtml = `
    <div class="glass panel" style="padding: 12px; margin-bottom: 12px; border-left: 3px solid ${health.modelLoaded ? 'var(--green)' : 'var(--amber)'};">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">${health.modelLoaded ? '🤖' : '⚠️'}</span>
        <div>
          <h4 style="margin: 0; color: var(--text); font-size: 13px;">ML Prediction Engine</h4>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: var(--muted);">
            Status: ${health.modelLoaded ? '✅ Active' : '❌ Offline'}
            ${health.modelLoaded ? ` | Models: ${health.availableCars.length}` : ''}
          </p>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = statusHtml;
}

export default {
  checkMLHealth,
  predictRange,
  predictBatchRange,
  getCarTypes,
  formatVehicleForML,
  updateVehicleRangeML,
  getPredictedRange,
  displayMLStatus
};
