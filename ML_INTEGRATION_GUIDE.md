# 🤖 ML Integration Guide - VoltEdge EV

## Overview

This guide explains how to integrate the Python-based Machine Learning model (ElasticNet) with the VoltEdge EV web application for real-time range predictions.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (JavaScript)                     │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Admin Dashboard│  │Driver Dashboard│  │  ML Demo Page   │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                               │
│                    ┌─────────▼──────────┐                   │
│                    │   ml-service.js    │                   │
│                    └─────────┬──────────┘                   │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼───────────────────────────────┐
│              Backend (Python Flask API)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     app.py                             │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │ /api/predict│  │ /api/health │  │ /api/car-types │  │  │
│  │  └─────────────┘  └──────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │         ML Model Artifacts                             │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │ ev_model.pkl│  │ev_scaler  │  │  ev_encoders    │  │  │
│  │  │ (ElasticNet)│  │   .pkl    │  │     .pkl        │  │  │
│  │  └─────────────┘  └──────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
EV-cars-/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── train_model.py          # Model training script
│   └── requirements.txt        # Python dependencies
│
├── js/
│   ├── script.js               # Main application logic
│   └── ml-service.js           # ML API integration service
│
├── data/
│   └── fleet-dataset.json      # Vehicle data (5000 records)
│
├── ev_model.pkl                # Trained ElasticNet model
├── ev_scaler.pkl               # StandardScaler for features
├── ev_encoders.pkl             # Label encoders + car defaults
├── model.ipynb                 # Original training notebook
└── ml-demo.html                # ML prediction demo page
```

## 🚀 Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Dependencies:**
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- scikit-learn 1.3.2 - ML library
- pandas 2.1.4 - Data manipulation
- numpy 1.26.2 - Numerical computing

### 2. Train/Retrain the Model (Optional)

If you want to retrain the model with updated data:

```bash
# Make sure you have the Excel dataset
python backend/train_model.py
```

This will generate:
- `ev_model.pkl` - The trained model
- `ev_scaler.pkl` - Feature scaler
- `ev_encoders.pkl` - Categorical encoders and car specifications

**Model Details:**
- Algorithm: ElasticNet Regression
- Features: 12 (car type, battery %, road type, speed, etc.)
- Performance: R² Score ~0.875, RMSE ~36.7 km
- Training data: 25,000 records

### 3. Start the Flask API

```bash
python backend/app.py
```

The API will start on `http://localhost:5000`

**Available Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API and model status |
| `/api/predict` | POST | Predict range for one vehicle |
| `/api/predict/batch` | POST | Predict range for multiple vehicles |
| `/api/car-types` | GET | Get available car types and specs |

### 4. Start the Frontend

```bash
npm run dev
```

Or use Vite directly:
```bash
npx vite
```

The app will be available at `http://localhost:5173`

## 🧪 Testing the Integration

### Option 1: ML Demo Page

1. Open `http://localhost:5173/ml-demo.html`
2. Adjust vehicle parameters
3. Click "Predict Range"
4. View real-time ML predictions

### Option 2: API Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Single prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "car_type": "Tata Punch EV",
    "battery_percentage": 80,
    "road_type": "City",
    "speed_kmph": 60,
    "total_km_run": 15000,
    "passenger_count": 4,
    "charging_status": "Not Charging",
    "maintenance_status": "None"
  }'

# Get car types
curl http://localhost:5000/api/car-types
```

### Option 3: JavaScript Integration

```javascript
import { predictRange } from './js/ml-service.js';

const vehicleData = {
  car_type: 'Tata Punch EV',
  battery_percentage: 80,
  road_type: 'City',
  speed_kmph: 60,
  total_km_run: 15000,
  passenger_count: 4
};

const result = await predictRange(vehicleData);
console.log('Predicted range:', result.predictedRange, 'km');
```

## 📊 Model Features

The ML model uses these 12 features for prediction:

| Feature | Type | Description |
|---------|------|-------------|
| `car_type` | Categorical | Vehicle model (encoded) |
| `battery_capacity_kwh` | Numeric | Battery capacity in kWh |
| `max_range_km` | Numeric | Manufacturer max range |
| `vehicle_weight_kg` | Numeric | Vehicle weight |
| `motor_power_kw` | Numeric | Motor power in kW |
| `battery_percentage` | Numeric | Current battery level (0-100) |
| `road_type` | Categorical | City or Highway (encoded) |
| `speed_kmph` | Numeric | Current speed |
| `charging_status` | Categorical | Charging state (encoded) |
| `maintenance_status` | Categorical | Maintenance state (encoded) |
| `total_km_run` | Numeric | Total kilometers driven |
| `passenger_count` | Numeric | Number of passengers |

## 🎯 Supported Vehicle Models

1. **Tata Punch EV**
   - Battery: 35 kWh
   - Max Range: 315 km
   - Weight: 1,308 kg
   - Motor: 90 kW

2. **MG ZS EV**
   - Battery: 50.3 kWh
   - Max Range: 419 km
   - Weight: 1,809 kg
   - Motor: 130 kW

3. **Volvo EX40**
   - Battery: 69 kWh
   - Max Range: 438 km
   - Weight: 2,148 kg
   - Motor: 170 kW

## 🔌 Integration with Dashboards

### Admin Dashboard Integration

Add ML predictions to the fleet monitoring view:

```javascript
import { updateVehicleRangeML } from './js/ml-service.js';

// Update a single vehicle
const updatedVehicle = await updateVehicleRangeML(vehicle);

// Update entire fleet
const fleet = await fleet();
const updatedFleet = await Promise.all(
  fleet.map(v => updateVehicleRangeML(v))
);
```

### Driver Dashboard Integration

Show ML-predicted range in real-time:

```javascript
import { getPredictedRange, displayMLStatus } from './js/ml-service.js';

// Get prediction with automatic fallback
const predictedRange = await getPredictedRange(currentVehicle);

// Display ML status badge
await displayMLStatus('mlStatusContainer');
```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/app.py`:

```python
# Change API port
app.run(debug=True, host='0.0.0.0', port=5000)

# Enable/disable CORS
CORS(app, origins=['http://localhost:5173'])
```

### Frontend Configuration

Edit `js/ml-service.js`:

```javascript
// Change API base URL
const ML_API_BASE = 'http://localhost:5000/api';

// Configure fallback behavior
// (Use formula if ML API is unavailable)
```

## 🐛 Troubleshooting

### Issue: Model not loading

**Symptom:** API returns `model_loaded: false`

**Solution:**
1. Check if `ev_model.pkl` exists in root directory
2. Run `python backend/train_model.py` to generate model
3. Verify Python version compatibility (3.8+)

### Issue: CORS errors in browser

**Symptom:** Console shows CORS policy errors

**Solution:**
1. Install flask-cors: `pip install flask-cors`
2. Verify Flask API is running
3. Check browser network tab for API calls

### Issue: Prediction accuracy is low

**Symptom:** Predictions don't match expected values

**Solution:**
1. Ensure `ev_scaler.pkl` is loaded properly
2. Retrain model with more data
3. Verify input feature ranges match training data

### Issue: API connection refused

**Symptom:** `fetch` fails with connection error

**Solution:**
1. Start Flask API: `python backend/app.py`
2. Check firewall settings
3. Verify port 5000 is not in use

## 📈 Model Performance

| Metric | Training | Test |
|--------|----------|------|
| R² Score | 0.8782 | 0.8751 |
| MSE | - | 1350.01 |
| RMSE | - | 36.74 km |
| MAE | - | ~28 km |

**Interpretation:**
- R² of 0.875 means the model explains 87.5% of variance
- Average prediction error is ~28 km
- Model performs well on both city and highway scenarios

## 🔒 Security Considerations

1. **API Authentication**: Add JWT tokens for production
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all input parameters
4. **CORS Configuration**: Restrict allowed origins in production
5. **HTTPS**: Use HTTPS in production deployment

## 🚀 Production Deployment

### Deploy Flask API

**Option 1: Gunicorn (Linux/Mac)**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

**Option 2: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ backend/
COPY *.pkl ./
CMD ["python", "backend/app.py"]
```

### Environment Variables

```bash
export FLASK_ENV=production
export ML_MODEL_PATH=/path/to/ev_model.pkl
export ML_SCALER_PATH=/path/to/ev_scaler.pkl
export ML_ENCODERS_PATH=/path/to/ev_encoders.pkl
```

## 📚 API Documentation

### POST /api/predict

**Request Body:**
```json
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
```

**Response:**
```json
{
  "success": true,
  "predicted_range_km": 235.67,
  "inputs": { ... },
  "car_specs": { ... }
}
```

### GET /api/health

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "available_cars": ["Tata Punch EV", "MG ZS EV", "Volvo EX40"]
}
```

## 🎓 Next Steps

1. **Improve Model**: Add more features (weather, traffic, driver behavior)
2. **Real-time Learning**: Implement online learning with actual trip data
3. **Multiple Models**: Train separate models for each vehicle type
4. **Deep Learning**: Experiment with neural networks (LSTM for time-series)
5. **A/B Testing**: Compare ML predictions vs formula-based calculations

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Flask logs: `python backend/app.py` (debug mode)
- Inspect browser console for frontend errors
- Test API endpoints directly with cURL/Postman

---

**Built with ❤️ for VoltEdge EV Fleet Management**
