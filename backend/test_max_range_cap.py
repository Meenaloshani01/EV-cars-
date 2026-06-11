"""
Test script to verify predictions are capped at max range
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_max_range_cap():
    """Test that predictions don't exceed manufacturer max range"""
    
    print("\n" + "="*70)
    print("  Testing Max Range Cap for All Vehicles")
    print("="*70)
    
    # Test cases: 100% battery, optimal conditions
    test_cases = [
        {
            "name": "MG ZS EV",
            "max_range": 419,
            "data": {
                "car_type": "MG ZS EV",
                "battery_percentage": 100,
                "road_type": "Highway",
                "speed_kmph": 80,
                "total_km_run": 20000,
                "passenger_count": 2
            }
        },
        {
            "name": "Tata Punch EV",
            "max_range": 315,
            "data": {
                "car_type": "Tata Punch EV",
                "battery_percentage": 100,
                "road_type": "City",
                "speed_kmph": 60,
                "total_km_run": 15000,
                "passenger_count": 2
            }
        },
        {
            "name": "Volvo EX40",
            "max_range": 438,
            "data": {
                "car_type": "Volvo EX40",
                "battery_percentage": 100,
                "road_type": "Highway",
                "speed_kmph": 80,
                "total_km_run": 25000,
                "passenger_count": 2
            }
        }
    ]
    
    results = []
    
    for test in test_cases:
        print(f"\n📊 Testing: {test['name']}")
        print(f"   Max Range (Manufacturer): {test['max_range']} km")
        
        try:
            response = requests.post(
                f"{API_BASE}/predict",
                json=test['data'],
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            data = response.json()
            
            if data.get('success'):
                predicted = data['predicted_range_km']
                max_range = test['max_range']
                
                print(f"   Predicted Range: {predicted} km")
                
                if predicted <= max_range:
                    print(f"   ✅ PASS: Prediction within limit ({predicted} <= {max_range})")
                    status = "PASS"
                else:
                    print(f"   ❌ FAIL: Prediction exceeds limit ({predicted} > {max_range})")
                    status = "FAIL"
                
                results.append({
                    'car': test['name'],
                    'max_range': max_range,
                    'predicted': predicted,
                    'status': status
                })
            else:
                print(f"   ❌ ERROR: {data.get('error', 'Unknown error')}")
                results.append({
                    'car': test['name'],
                    'max_range': max_range,
                    'predicted': None,
                    'status': 'ERROR'
                })
                
        except Exception as e:
            print(f"   ❌ EXCEPTION: {e}")
            results.append({
                'car': test['name'],
                'max_range': test['max_range'],
                'predicted': None,
                'status': 'EXCEPTION'
            })
    
    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    
    print(f"\n{'Car Type':<20} {'Max Range':<15} {'Predicted':<15} {'Status':<10}")
    print("-" * 70)
    
    for result in results:
        predicted_str = f"{result['predicted']} km" if result['predicted'] else "N/A"
        print(f"{result['car']:<20} {result['max_range']:<15} {predicted_str:<15} {result['status']:<10}")
    
    # Count results
    passed = sum(1 for r in results if r['status'] == 'PASS')
    failed = sum(1 for r in results if r['status'] == 'FAIL')
    errors = sum(1 for r in results if r['status'] in ['ERROR', 'EXCEPTION'])
    
    print("\n" + "="*70)
    print(f"✅ Passed: {passed}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    print(f"⚠️  Errors: {errors}/{len(results)}")
    print("="*70)
    
    if failed == 0 and errors == 0:
        print("\n🎉 All tests passed! Predictions are properly capped at max range.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the results above.")
        return 1


if __name__ == '__main__':
    import sys
    
    print("\n🚗 VoltEdge EV - Max Range Cap Test")
    print("Make sure Flask API is running: python backend/app.py\n")
    
    try:
        sys.exit(test_max_range_cap())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
