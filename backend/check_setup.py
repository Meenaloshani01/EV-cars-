"""
Setup Verification Script
Checks if all required components are properly installed and configured
"""

import os
import sys

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor}.{version.micro} (Need 3.8+)")
        return False

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\n📦 Checking Python dependencies...")
    
    required = {
        'flask': 'Flask',
        'flask_cors': 'Flask-CORS',
        'sklearn': 'scikit-learn',
        'pandas': 'pandas',
        'numpy': 'numpy'
    }
    
    all_installed = True
    for module, name in required.items():
        try:
            __import__(module)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} (Not installed)")
            all_installed = False
    
    if not all_installed:
        print("\n   Install missing packages:")
        print("   pip install -r backend/requirements.txt")
    
    return all_installed

def check_model_files():
    """Check if model files exist"""
    print("\n🤖 Checking ML model files...")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    
    files = {
        'ev_model.pkl': 'ML Model',
        'ev_scaler.pkl': 'Feature Scaler (Optional)',
        'ev_encoders.pkl': 'Label Encoders (Optional)'
    }
    
    model_exists = False
    for filename, description in files.items():
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            size_mb = os.path.getsize(filepath) / (1024 * 1024)
            print(f"   ✅ {description}: {filename} ({size_mb:.2f} MB)")
            if filename == 'ev_model.pkl':
                model_exists = True
        else:
            marker = "❌" if filename == 'ev_model.pkl' else "⚠️"
            print(f"   {marker} {description}: {filename} (Not found)")
    
    if not model_exists:
        print("\n   Generate model files:")
        print("   python backend/train_model.py")
    
    return model_exists

def check_data_files():
    """Check if data files exist"""
    print("\n📊 Checking data files...")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, 'data')
    
    if not os.path.exists(data_dir):
        print("   ❌ data/ directory not found")
        return False
    
    dataset_file = os.path.join(data_dir, 'fleet-dataset.json')
    if os.path.exists(dataset_file):
        size_mb = os.path.getsize(dataset_file) / (1024 * 1024)
        print(f"   ✅ Fleet dataset: fleet-dataset.json ({size_mb:.2f} MB)")
        return True
    else:
        print("   ⚠️ fleet-dataset.json not found (will use fallback data)")
        return False

def check_frontend():
    """Check if frontend files exist"""
    print("\n🌐 Checking frontend files...")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    
    files = [
        ('js/ml-service.js', 'ML Service'),
        ('ml-demo.html', 'ML Demo Page'),
        ('package.json', 'Node.js Config')
    ]
    
    all_exist = True
    for filename, description in files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            print(f"   ✅ {description}: {filename}")
        else:
            print(f"   ❌ {description}: {filename} (Not found)")
            all_exist = False
    
    return all_exist

def test_model_loading():
    """Try to load the model"""
    print("\n🔍 Testing model loading...")
    
    try:
        import pickle
        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, 'ev_model.pkl')
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        print(f"   ✅ Model loaded successfully")
        print(f"   Model type: {type(model).__name__}")
        
        # Try a test prediction
        import numpy as np
        test_input = np.array([[0, 35, 315, 1308, 90, 80, 0, 60, 0, 2, 15000, 4]])
        
        # Check if scaler exists
        scaler_path = os.path.join(base_dir, 'ev_scaler.pkl')
        if os.path.exists(scaler_path):
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
            test_input = scaler.transform(test_input)
            print("   ✅ Scaler loaded successfully")
        
        prediction = model.predict(test_input)
        print(f"   ✅ Test prediction: {prediction[0]:.2f} km")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error loading model: {e}")
        return False

def print_summary(results):
    """Print summary and recommendations"""
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n✅ All checks passed! You're ready to go!")
        print("\n🚀 Next steps:")
        print("   1. Start Flask API: python backend/app.py")
        print("   2. Start Frontend: npm run dev")
        print("   3. Open: http://localhost:5173/ml-demo.html")
    else:
        print("\n⚠️ Some checks failed. Please fix the issues above.")
        
        if not results['dependencies']:
            print("\n📦 Install dependencies:")
            print("   pip install -r backend/requirements.txt")
        
        if not results['model']:
            print("\n🤖 Generate model:")
            print("   python backend/train_model.py")
    
    print("\n" + "=" * 60)

def main():
    """Run all checks"""
    print("=" * 60)
    print("   VoltEdge EV - Setup Verification")
    print("=" * 60)
    
    results = {
        'python': check_python_version(),
        'dependencies': check_dependencies(),
        'model': check_model_files(),
        'data': check_data_files(),
        'frontend': check_frontend(),
    }
    
    # Only test loading if model exists
    if results['model']:
        results['loading'] = test_model_loading()
    
    print_summary(results)
    
    return 0 if all(results.values()) else 1

if __name__ == '__main__':
    sys.exit(main())
