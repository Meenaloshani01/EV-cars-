from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load the trained model and artifacts
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ev_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'ev_scaler.pkl')
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), '..', 'ev_encoders.pkl')

# Initialize default values
car_encoder = LabelEncoder()
car_encoder.classes_ = np.array(['MG ZS EV', 'Tata Punch EV', 'Volvo EX40'])

road_encoder = LabelEncoder()
road_encoder.classes_ = np.array(['City', 'Highway'])

charging_encoder = LabelEncoder()
charging_encoder.classes_ = np.array(['Charging', 'Fast', 'Not Charging', 'Slow'])

maintenance_encoder = LabelEncoder()
maintenance_encoder.classes_ = np.array(['Completed', 'Low', 'None', 'Unknown'])

# Default car specs
car_defaults = {
    'MG ZS EV': {
        'battery_capacity_kwh': 50.3,
        'max_range_km': 419,
        'vehicle_weight_kg': 1809,
        'motor_power_kw': 130
    },
    'Tata Punch EV': {
        'battery_capacity_kwh': 35,
        'max_range_km': 315,
        'vehicle_weight_kg': 1308,
        'motor_power_kw': 90
    },
    'Volvo EX40': {
        'battery_capacity_kwh': 69,
        'max_range_km': 438,
        'vehicle_weight_kg': 2148,
        'motor_power_kw': 170
    }
}

scaler = StandardScaler()
model = None

# Try to load all artifacts
try:
    # Load model
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully!")
    
    # Try to load scaler
    if os.path.exists(SCALER_PATH):
        with open(SCALER_PATH, 'rb') as f:
            scaler = pickle.load(f)
        print("✅ Scaler loaded successfully!")
    else:
        print("⚠️ Scaler not found, using default (may affect accuracy)")
    
    # Try to load encoders
    if os.path.exists(ENCODERS_PATH):
        with open(ENCODERS_PATH, 'rb') as f:
            encoders_data = pickle.load(f)
            car_encoder = encoders_data.get('car_encoder', car_encoder)
            road_encoder = encoders_data.get('road_encoder', road_encoder)
            charging_encoder = encoders_data.get('charging_encoder', charging_encoder)
            maintenance_encoder = encoders_data.get('maintenance_encoder', maintenance_encoder)
            car_defaults = encoders_data.get('car_defaults', car_defaults)
        print("✅ Encoders loaded successfully!")
    else:
        print("⚠️ Encoders not found, using defaults")
        
except Exception as e:
    print(f"⚠️ Error loading model artifacts: {e}")
    model = None


def safe_encode(encoder, value):
    """Safely encode a value, return 0 if not in classes"""
    if value in encoder.classes_:
        return encoder.transform([value])[0]
    return 0


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'available_cars': list(car_defaults.keys())
    })


@app.route('/api/predict', methods=['POST'])
def predict_range():
    """
    Predict remaining distance for an EV
    Expected JSON body:
    {
        "car_type": "Tata Punch EV",
        "battery_percentage": 80,
        "road_type": "City",
        "speed_kmph": 60,
        "total_km_run": 15000,
        "passenger_count": 4,
        "charging_status": "Not Charging",
        "maintenance_status": "None"
    }
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        data = request.json
        
        # Extract input parameters
        car_type = data.get('car_type', 'Tata Punch EV')
        battery_percentage = int(data.get('battery_percentage', 80))
        road_type = data.get('road_type', 'City')
        speed_kmph = int(data.get('speed_kmph', 60))
        total_km_run = int(data.get('total_km_run', 10000))
        passenger_count = int(data.get('passenger_count', 2))
        charging_status = data.get('charging_status', 'Not Charging')
        maintenance_status = data.get('maintenance_status', 'None')
        
        # Get car defaults
        if car_type not in car_defaults:
            car_type = 'Tata Punch EV'  # Default fallback
        
        car_default = car_defaults[car_type]
        battery_capacity_kwh = car_default['battery_capacity_kwh']
        max_range_km = car_default['max_range_km']
        vehicle_weight_kg = car_default['vehicle_weight_kg']
        motor_power_kw = car_default['motor_power_kw']
        
        # Encode categorical variables
        car_encoded = safe_encode(car_encoder, car_type)
        road_encoded = safe_encode(road_encoder, road_type)
        charging_encoded = safe_encode(charging_encoder, charging_status)
        maintenance_encoded = safe_encode(maintenance_encoder, maintenance_status)
        
        # Create input array (same order as training)
        input_data = np.array([[
            car_encoded,
            battery_capacity_kwh,
            max_range_km,
            vehicle_weight_kg,
            motor_power_kw,
            battery_percentage,
            road_encoded,
            speed_kmph,
            charging_encoded,
            maintenance_encoded,
            total_km_run,
            passenger_count
        ]])
        
        # Scale the input using the loaded scaler
        input_scaled = scaler.transform(input_data)
        
        # Make prediction
        prediction = model.predict(input_scaled)
        predicted_range = max(0, round(float(prediction[0]), 2))
        
        # Cap prediction at max_range_km (cannot exceed manufacturer's max range)
        if predicted_range > max_range_km:
            predicted_range = max_range_km
        
        return jsonify({
            'success': True,
            'predicted_range_km': predicted_range,
            'inputs': {
                'car_type': car_type,
                'battery_percentage': battery_percentage,
                'road_type': road_type,
                'speed_kmph': speed_kmph,
                'total_km_run': total_km_run,
                'passenger_count': passenger_count
            },
            'car_specs': car_default
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict remaining distance for multiple vehicles
    Expected JSON body:
    {
        "vehicles": [
            {vehicle1_data},
            {vehicle2_data},
            ...
        ]
    }
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        data = request.json
        vehicles = data.get('vehicles', [])
        
        predictions = []
        for vehicle in vehicles:
            # Reuse the single prediction logic
            with app.test_request_context('/api/predict', json=vehicle):
                response = predict_range()
                if response[0].get('success'):
                    predictions.append(response[0])
        
        return jsonify({
            'success': True,
            'count': len(predictions),
            'predictions': predictions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/car-types', methods=['GET'])
def get_car_types():
    """Get available car types and their specifications"""
    return jsonify({
        'car_types': [
            {
                'name': car_type,
                'specs': specs
            }
            for car_type, specs in car_defaults.items()
        ]
    })


if __name__ == '__main__':
    print("\n🚗 VoltEdge EV - ML Prediction API")
    print("=" * 50)
    print(f"Model Status: {'✅ Loaded' if model is not None else '❌ Not Loaded'}")
    print(f"Available Car Types: {list(car_defaults.keys())}")
    print("=" * 50)
    print("\n🌐 Starting Flask server on http://localhost:5000\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
