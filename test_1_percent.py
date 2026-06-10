import requests
import json

# Test 1% battery prediction
test_data = {
    "car_type": "Tata Punch EV",
    "battery_percentage": 1,
    "road_type": "City",
    "speed_kmph": 40,
    "total_km_run": 20000,
    "passenger_count": 2
}

print("Testing 1% battery prediction...")
print(f"Input: {json.dumps(test_data, indent=2)}")
print()

try:
    response = requests.post(
        'http://localhost:5000/api/predict',
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    result = response.json()
    
    if result.get('success'):
        print(f"✅ Prediction successful!")
        print(f"Predicted Range: {result['predicted_range_km']} km")
        print(f"Raw Prediction: {result.get('raw_prediction', 'N/A')} km")
        print(f"Max Range: {result.get('max_range_km', 'N/A')} km")
        print()
        print(f"Expected range (theoretical): ~3.15 km (1% of 315 km)")
        print()
        
        if result['predicted_range_km'] > 10:
            print("⚠️ WARNING: Prediction seems too high for 1% battery!")
            print("   This suggests the model might have an issue with low battery predictions.")
    else:
        print(f"❌ Error: {result.get('error')}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
    print("Make sure Flask API is running: python backend/app.py")
