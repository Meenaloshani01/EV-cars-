"""
API Testing Script
Tests all Flask API endpoints to ensure they're working correctly
"""

import requests
import json
import sys
import time

API_BASE = 'http://localhost:5000/api'

def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_test(name, passed):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")

def test_health():
    """Test health check endpoint"""
    print_header("Testing Health Check")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('status') == 'healthy' and
            'model_loaded' in data
        )
        
        print_test("Health endpoint responds", passed)
        print(f"Status: {data.get('status')}")
        print(f"Model Loaded: {data.get('model_loaded')}")
        print(f"Available Cars: {data.get('available_cars')}")
        
        return passed
        
    except requests.exceptions.RequestException as e:
        print_test("Health endpoint responds", False)
        print(f"Error: {e}")
        return False

def test_single_prediction():
    """Test single vehicle prediction"""
    print_header("Testing Single Prediction")
    
    test_data = {
        "car_type": "Tata Punch EV",
        "battery_percentage": 80,
        "road_type": "City",
        "speed_kmph": 60,
        "total_km_run": 15000,
        "passenger_count": 4,
        "charging_status": "Not Charging",
        "maintenance_status": "None"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('success') == True and
            'predicted_range_km' in data
        )
        
        print_test("Prediction endpoint responds", passed)
        
        if passed:
            print(f"\nInput:")
            print(f"  Car: {test_data['car_type']}")
            print(f"  Battery: {test_data['battery_percentage']}%")
            print(f"  Road: {test_data['road_type']}")
            print(f"  Speed: {test_data['speed_kmph']} km/h")
            print(f"\nPrediction:")
            print(f"  Range: {data['predicted_range_km']} km")
            
            # Validate prediction is reasonable
            predicted_range = data['predicted_range_km']
            is_reasonable = 0 < predicted_range < 400
            print_test(f"Prediction is reasonable (0-400 km)", is_reasonable)
            
            return passed and is_reasonable
        else:
            print(f"Error: {data}")
            return False
        
    except requests.exceptions.RequestException as e:
        print_test("Prediction endpoint responds", False)
        print(f"Error: {e}")
        return False

def test_batch_prediction():
    """Test batch predictions"""
    print_header("Testing Batch Predictions")
    
    test_vehicles = [
        {
            "car_type": "Tata Punch EV",
            "battery_percentage": 90,
            "road_type": "Highway",
            "speed_kmph": 80,
            "total_km_run": 10000,
            "passenger_count": 2
        },
        {
            "car_type": "MG ZS EV",
            "battery_percentage": 75,
            "road_type": "City",
            "speed_kmph": 50,
            "total_km_run": 20000,
            "passenger_count": 4
        },
        {
            "car_type": "Volvo EX40",
            "battery_percentage": 60,
            "road_type": "City",
            "speed_kmph": 40,
            "total_km_run": 30000,
            "passenger_count": 3
        }
    ]
    
    try:
        response = requests.post(
            f"{API_BASE}/predict/batch",
            json={"vehicles": test_vehicles},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('success') == True and
            data.get('count') == len(test_vehicles)
        )
        
        print_test("Batch prediction endpoint responds", passed)
        
        if passed:
            print(f"\nProcessed {data['count']} vehicles:")
            for i, pred in enumerate(data['predictions'], 1):
                if pred.get('success'):
                    print(f"  {i}. {pred['inputs']['car_type']}: {pred['predicted_range_km']} km")
        else:
            print(f"Error: {data}")
            
        return passed
        
    except requests.exceptions.RequestException as e:
        print_test("Batch prediction endpoint responds", False)
        print(f"Error: {e}")
        return False

def test_car_types():
    """Test car types endpoint"""
    print_header("Testing Car Types")
    
    try:
        response = requests.get(f"{API_BASE}/car-types", timeout=5)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            'car_types' in data and
            len(data['car_types']) > 0
        )
        
        print_test("Car types endpoint responds", passed)
        
        if passed:
            print(f"\nAvailable car types ({len(data['car_types'])}):")
            for car in data['car_types']:
                print(f"\n  {car['name']}:")
                for key, value in car['specs'].items():
                    print(f"    {key}: {value}")
        
        return passed
        
    except requests.exceptions.RequestException as e:
        print_test("Car types endpoint responds", False)
        print(f"Error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid data"""
    print_header("Testing Error Handling")
    
    # Test with invalid car type
    invalid_data = {
        "car_type": "NonExistentCar",
        "battery_percentage": 80,
        "road_type": "City",
        "speed_kmph": 60,
        "total_km_run": 15000,
        "passenger_count": 4
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/predict",
            json=invalid_data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        # Should still return success with fallback to default car
        passed = response.status_code in [200, 400]
        print_test("Invalid input handled gracefully", passed)
        
        return passed
        
    except requests.exceptions.RequestException as e:
        print_test("Error handling test", False)
        print(f"Error: {e}")
        return False

def test_response_time():
    """Test API response time"""
    print_header("Testing Response Time")
    
    test_data = {
        "car_type": "Tata Punch EV",
        "battery_percentage": 80,
        "road_type": "City",
        "speed_kmph": 60,
        "total_km_run": 15000,
        "passenger_count": 4
    }
    
    try:
        start = time.time()
        response = requests.post(
            f"{API_BASE}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        passed = elapsed < 500  # Should respond in under 500ms
        print_test(f"Response time < 500ms (actual: {elapsed:.2f}ms)", passed)
        
        return passed
        
    except requests.exceptions.RequestException as e:
        print_test("Response time test", False)
        print(f"Error: {e}")
        return False

def run_all_tests():
    """Run all API tests"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 15 + "VoltEdge ML API Tests" + " " * 22 + "║")
    print("╚" + "=" * 58 + "╝")
    
    print(f"\nTesting API at: {API_BASE}")
    print("Make sure Flask server is running: python backend/app.py")
    print("\nStarting tests...\n")
    
    tests = [
        ("Health Check", test_health),
        ("Single Prediction", test_single_prediction),
        ("Batch Predictions", test_batch_prediction),
        ("Car Types", test_car_types),
        ("Error Handling", test_error_handling),
        ("Response Time", test_response_time),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Unexpected error in {name}: {e}")
            results.append((name, False))
    
    # Print summary
    print_header("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print(f"\n{'=' * 60}")
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above.")
        return 1

if __name__ == '__main__':
    sys.exit(run_all_tests())
