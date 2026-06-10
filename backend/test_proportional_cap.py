"""
Test script to verify proportional capping based on battery percentage
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_proportional_cap():
    """Test that predictions are proportional to battery percentage"""
    
    print("\n" + "="*70)
    print("  Testing Proportional Cap for Battery Percentages")
    print("="*70)
    
    # Test Tata Punch EV at different battery levels
    battery_levels = [1, 10, 25, 50, 75, 100]
    car_type = "Tata Punch EV"
    max_range = 315  # km
    
    print(f"\n🚗 Testing: {car_type}")
    print(f"   Max Range: {max_range} km\n")
    
    print(f"{'Battery %':<12} {'Theoretical':<15} {'Raw Pred':<15} {'Final Pred':<15} {'Status':<20}")
    print("-" * 80)
    
    results = []
    
    for battery in battery_levels:
        theoretical = (battery / 100) * max_range
        
        test_data = {
            "car_type": car_type,
            "battery_percentage": battery,
            "road_type": "City",
            "speed_kmph": 40,
            "total_km_run": 15000,
            "passenger_count": 2
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/predict",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            data = response.json()
            
            if data.get('success'):
                raw_pred = data.get('raw_prediction', 0)
                final_pred = data['predicted_range_km']
                cap_reason = data.get('cap_reason', 'None')
                
                # Check if prediction is reasonable
                # Should be <= theoretical max * 1.1
                is_reasonable = final_pred <= (theoretical * 1.1 + 1)  # +1 for rounding
                
                status = "✅ OK" if is_reasonable else "❌ TOO HIGH"
                
                if cap_reason and cap_reason != 'None':
                    status = "⚠️ CAPPED"
                
                print(f"{battery:>3}%        {theoretical:>6.1f} km      {raw_pred:>6.1f} km      {final_pred:>6.1f} km      {status}")
                
                results.append({
                    'battery': battery,
                    'theoretical': theoretical,
                    'raw': raw_pred,
                    'final': final_pred,
                    'capped': cap_reason is not None and cap_reason != 'None',
                    'reasonable': is_reasonable
                })
            else:
                print(f"{battery:>3}%        {theoretical:>6.1f} km      ERROR: {data.get('error')}")
                
        except Exception as e:
            print(f"{battery:>3}%        {theoretical:>6.1f} km      EXCEPTION: {e}")
    
    # Analysis
    print("\n" + "="*70)
    print("  ANALYSIS")
    print("="*70)
    
    if results:
        # Check 1% battery specifically
        one_percent = next((r for r in results if r['battery'] == 1), None)
        if one_percent:
            print(f"\n📊 1% Battery Test:")
            print(f"   Theoretical: {one_percent['theoretical']:.1f} km")
            print(f"   Raw Prediction: {one_percent['raw']:.1f} km")
            print(f"   Final Prediction: {one_percent['final']:.1f} km")
            if one_percent['final'] <= one_percent['theoretical'] * 1.1 + 1:
                print(f"   ✅ PASS: Prediction is reasonable")
            else:
                print(f"   ❌ FAIL: Prediction too high for 1% battery")
        
        # Check if predictions scale proportionally
        print(f"\n📊 Proportionality Check:")
        capped_count = sum(1 for r in results if r['capped'])
        reasonable_count = sum(1 for r in results if r['reasonable'])
        
        print(f"   Capped predictions: {capped_count}/{len(results)}")
        print(f"   Reasonable predictions: {reasonable_count}/{len(results)}")
        
        if reasonable_count == len(results):
            print(f"   ✅ All predictions are within reasonable limits!")
        else:
            print(f"   ⚠️ Some predictions may be unrealistic")
    
    print("\n" + "="*70)
    
    return 0


if __name__ == '__main__':
    import sys
    
    print("\n🚗 VoltEdge EV - Proportional Cap Test")
    print("Make sure Flask API is running: python backend/app.py\n")
    
    try:
        sys.exit(test_proportional_cap())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
