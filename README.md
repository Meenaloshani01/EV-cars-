# VoltEdge EV

Next-gen EV fleet management dashboard built with Firebase and Vite.

## 🤖 NEW: Machine Learning Integration

VoltEdge now includes an AI-powered range prediction system using a trained ElasticNet model!

### Quick Start with ML

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the ML API:**
   ```bash
   python backend/app.py
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

4. **Test predictions:**
   - Open `http://localhost:5173/ml-demo.html`
   - Or check `QUICKSTART.md` for detailed instructions

### ML Features

- 🎯 **Accurate Predictions**: 87.5% R² score with ~28 km average error
- 🚗 **3 Vehicle Models**: Tata Punch EV, MG ZS EV, Volvo EX40
- ⚡ **Real-time API**: RESTful Flask API for instant predictions
- 🔄 **Auto Fallback**: Uses formula-based calculation if API is unavailable
- 📊 **12 Input Features**: Battery %, speed, road type, passengers, and more

### Documentation

- 📘 [Quick Start Guide](QUICKSTART.md) - Get running in 3 steps
- 📗 [ML Integration Guide](ML_INTEGRATION_GUIDE.md) - Complete documentation
- 📓 [Training Notebook](model.ipynb) - Original model development

### Model Performance

| Metric | Value |
|--------|-------|
| R² Score | 0.875 |
| RMSE | 36.7 km |
| MAE | ~28 km |
| Training Data | 25,000 records |

---

## Original Features

- Real-time fleet monitoring
- Firebase authentication & Firestore database
- Admin & Driver dashboards
- Battery analytics
- Revenue tracking
- Maintenance monitoring
