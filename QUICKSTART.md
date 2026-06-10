# 🚀 Quick Start Guide - ML Integration

## Prerequisites

✅ Python 3.8 or higher  
✅ Node.js 16+ and npm  
✅ Your trained model file `ev_model.pkl`

## 🏃 Run in 3 Steps

### Step 1: Install Dependencies

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install Node dependencies (if not already done)
npm install
```

### Step 2: Start the ML API

Open a terminal and run:

```bash
python backend/app.py
```

You should see:
```
🚗 VoltEdge EV - ML Prediction API
==================================================
Model Status: ✅ Loaded
Available Car Types: ['Tata Punch EV', 'MG ZS EV', 'Volvo EX40']
==================================================

🌐 Starting Flask server on http://localhost:5000
```

### Step 3: Start the Frontend

Open a **new terminal** and run:

```bash
npm run dev
```

## 🎯 Test the Integration

### Option A: ML Demo Page (Recommended)

1. Open browser: `http://localhost:5173/ml-demo.html`
2. Fill in vehicle parameters
3. Click "Predict Range"
4. See real-time ML predictions! 🤖

### Option B: Test API Directly

```bash
curl -X POST http://localhost:5000/api/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"car_type\":\"Tata Punch EV\",\"battery_percentage\":80,\"road_type\":\"City\",\"speed_kmph\":60,\"total_km_run\":15000,\"passenger_count\":4}"
```

### Option C: Use Admin Dashboard

1. Open: `http://localhost:5173/admin-dashboard.html`
2. The fleet vehicles will automatically use ML predictions
3. Look for the "🤖 ML Predicted" badge on vehicles

## ⚡ Windows Quick Launch

Just double-click: `start-ml-system.bat`

This will:
- Install dependencies (if needed)
- Train model (if missing)
- Start Flask API
- Start Vite dev server

## 🔧 Troubleshooting

### Problem: Model not found

**Solution:**
```bash
python backend/train_model.py
```

### Problem: Port 5000 already in use

**Solution:** Kill the process or change port in `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

Also update `js/ml-service.js`:
```javascript
const ML_API_BASE = 'http://localhost:5001/api';
```

### Problem: CORS errors

**Solution:** Make sure flask-cors is installed:
```bash
pip install flask-cors
```

### Problem: Import errors

**Solution:** Install scikit-learn:
```bash
pip install scikit-learn pandas numpy
```

## 📖 Next Steps

- Read [ML_INTEGRATION_GUIDE.md](ML_INTEGRATION_GUIDE.md) for detailed documentation
- Check out [model.ipynb](model.ipynb) to understand the ML model
- Explore [js/ml-service.js](js/ml-service.js) for frontend integration examples

## 🎉 Success!

If you see predictions working, you've successfully integrated the ML model! 🚗⚡

The system will:
- Use ML predictions when API is available
- Automatically fall back to formula-based calculations if API is down
- Show ML status badges in the UI
- Update range predictions in real-time

---

**Questions?** Check the [ML_INTEGRATION_GUIDE.md](ML_INTEGRATION_GUIDE.md) for comprehensive documentation.
