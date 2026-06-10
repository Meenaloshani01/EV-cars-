# 🏗️ VoltEdge EV - ML System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Admin     │  │    Driver    │  │   ML Demo    │              │
│  │  Dashboard   │  │  Dashboard   │  │     Page     │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         └──────────────────┴──────────────────┘                      │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (JavaScript)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ml-service.js                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │ predictRange │  │checkMLHealth │  │ displayStatus│     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  • formatVehicleForML()                              │  │   │
│  │  │  • updateVehicleRangeML()                            │  │   │
│  │  │  • getPredictedRange() with auto-fallback           │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                     HTTP/REST (JSON)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API LAYER (Python Flask)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                       app.py                                 │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │ GET /health  │  │ POST /predict│  │GET /car-types│     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────┐                          │   │
│  │  │  POST /predict/batch          │                          │   │
│  │  └───────────────────────────────┘                          │   │
│  │                                                              │   │
│  │  Features:                                                   │   │
│  │  • CORS support for cross-origin requests                   │   │
│  │  • Input validation and error handling                      │   │
│  │  • JSON request/response                                    │   │
│  │  • Batch processing support                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ML LAYER (scikit-learn)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Model Artifacts                             │  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│  │
│  │  │  ev_model.pkl   │  │ ev_scaler.pkl   │  │ev_encoders   ││  │
│  │  │  (ElasticNet)   │  │(StandardScaler) │  │   .pkl       ││  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘│  │
│  │                                                               │  │
│  │  Model Specs:                                                │  │
│  │  • Algorithm: ElasticNet Regression                          │  │
│  │  • R² Score: 0.875                                           │  │
│  │  • RMSE: 36.7 km                                             │  │
│  │  • Features: 12 inputs                                       │  │
│  │  • Training Data: 25,000 records                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Single Prediction Flow

```
User Action
    │
    ▼
┌────────────────────────────────────────┐
│ 1. User enters vehicle parameters      │
│    - Car type: Tata Punch EV           │
│    - Battery: 80%                      │
│    - Road type: City                   │
│    - Speed: 60 km/h                    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 2. Frontend calls ml-service.js        │
│    predictRange(vehicleData)           │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 3. HTTP POST to API                    │
│    http://localhost:5000/api/predict   │
│    Content-Type: application/json      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 4. Flask API receives request          │
│    - Validates input                   │
│    - Encodes categorical variables     │
│    - Gets car specifications           │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 5. Prepare ML input                    │
│    - Encode: car_type, road_type       │
│    - Add: specs, battery, speed        │
│    - Create: 12-feature array          │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 6. Scale features                      │
│    input_scaled = scaler.transform()   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 7. Make prediction                     │
│    range = model.predict(input_scaled) │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 8. Return JSON response                │
│    {                                   │
│      "success": true,                  │
│      "predicted_range_km": 235.67,     │
│      "inputs": {...},                  │
│      "car_specs": {...}                │
│    }                                   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ 9. Frontend displays result            │
│    "Range: 235.67 km"                  │
│    🤖 ML Predicted                     │
└────────────────────────────────────────┘
```

## Data Flow

### Input Processing

```
Raw Vehicle Data
    │
    ├─ car_type: "Tata Punch EV"
    ├─ battery_percentage: 80
    ├─ road_type: "City"
    ├─ speed_kmph: 60
    ├─ total_km_run: 15000
    └─ passenger_count: 4
    │
    ▼
┌─────────────────────────────────┐
│   Categorical Encoding          │
│   car_type → 1 (Tata)          │
│   road_type → 0 (City)         │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   Add Car Specifications        │
│   battery_capacity_kwh: 35      │
│   max_range_km: 315             │
│   vehicle_weight_kg: 1308       │
│   motor_power_kw: 90            │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   Create Feature Vector (12)    │
│   [1, 35, 315, 1308, 90,        │
│    80, 0, 60, 0, 2, 15000, 4]   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   Scale Features                │
│   StandardScaler.transform()    │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   ML Prediction                 │
│   ElasticNet.predict()          │
└─────────────┬───────────────────┘
              │
              ▼
        Predicted Range: 235.67 km
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                      User Interface                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Forms    │  │   Charts   │  │  Badges    │             │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘             │
│         │                │                │                    │
│         └────────────────┴────────────────┘                   │
│                          │                                     │
│                  ┌───────▼────────┐                           │
│                  │  Event Handlers │                           │
│                  └───────┬────────┘                           │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  ml-service │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐     ┌──────▼──────┐    ┌────▼─────┐
   │ predict  │     │checkHealth  │    │ display  │
   │  Range   │     │             │    │  Status  │
   └────┬─────┘     └──────┬──────┘    └────┬─────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                   fetch() API calls
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
   ┌────▼─────┐                         ┌─────▼────┐
   │  POST    │                         │   GET    │
   │/predict  │                         │ /health  │
   └────┬─────┘                         └─────┬────┘
        │                                      │
        │      ┌───────────────────────────────┘
        │      │
   ┌────▼──────▼────┐
   │   Flask Router  │
   └────┬────────────┘
        │
   ┌────▼──────────┐
   │  Validation   │
   └────┬──────────┘
        │
   ┌────▼──────────┐
   │   Encoding    │
   └────┬──────────┘
        │
   ┌────▼──────────┐
   │    Scaling    │
   └────┬──────────┘
        │
   ┌────▼──────────┐
   │  ML Prediction│
   └────┬──────────┘
        │
   ┌────▼──────────┐
   │JSON Response  │
   └───────────────┘
```

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│         Developer Machine (localhost)    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Port 5173: Vite Dev Server       │ │
│  │   - Serves frontend files          │ │
│  │   - Hot module replacement         │ │
│  │   - Development mode               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Port 5000: Flask API             │ │
│  │   - ML prediction endpoints        │ │
│  │   - CORS enabled                   │ │
│  │   - Debug mode                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   File System                      │ │
│  │   - ev_model.pkl                   │ │
│  │   - ev_scaler.pkl                  │ │
│  │   - ev_encoders.pkl                │ │
│  │   - data/fleet-dataset.json        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer / CDN                    │
│                      (Cloudflare)                        │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │   Frontend      │      │   Backend       │
    │   (Vercel/      │      │   (AWS/GCP/     │
    │    Netlify)     │      │    Azure)       │
    │                 │      │                 │
    │ - Static files  │      │ - Flask API     │
    │ - React/Vue     │      │ - Gunicorn      │
    │ - Built assets  │      │ - Docker        │
    └─────────────────┘      └────────┬────────┘
                                      │
                             ┌────────▼────────┐
                             │  Model Storage  │
                             │  (S3/Blob)      │
                             │                 │
                             │ - ev_model.pkl  │
                             │ - ev_scaler.pkl │
                             │ - ev_encoders   │
                             └─────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│            Security Layers              │
├─────────────────────────────────────────┤
│                                         │
│  1. Transport Layer                     │
│     ├─ HTTPS/TLS encryption            │
│     └─ Secure WebSocket (wss://)       │
│                                         │
│  2. Authentication Layer                │
│     ├─ JWT tokens                       │
│     ├─ API keys                         │
│     └─ Firebase Auth                    │
│                                         │
│  3. Authorization Layer                 │
│     ├─ Role-based access (admin/driver)│
│     ├─ Resource permissions            │
│     └─ Rate limiting                    │
│                                         │
│  4. Input Validation                    │
│     ├─ Frontend validation             │
│     ├─ Backend validation              │
│     └─ Sanitization                     │
│                                         │
│  5. CORS Policy                         │
│     ├─ Allowed origins                 │
│     ├─ Allowed methods                 │
│     └─ Credentials handling            │
│                                         │
└─────────────────────────────────────────┘
```

## Scalability Considerations

```
┌──────────────────────────────────────────────┐
│          Horizontal Scaling                   │
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ API     │  │ API     │  │ API     │     │
│  │ Instance│  │ Instance│  │ Instance│     │
│  │    1    │  │    2    │  │    3    │     │
│  └────┬────┘  └────┬────┘  └────┬────┘     │
│       │            │            │           │
│       └────────────┴────────────┘           │
│                    │                         │
│         ┌──────────▼──────────┐             │
│         │   Load Balancer     │             │
│         └─────────────────────┘             │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          Caching Strategy                     │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │  Redis Cache                     │       │
│  │  - Frequent predictions          │       │
│  │  - Car specifications            │       │
│  │  - Health check status           │       │
│  └──────────────────────────────────┘       │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          Model Versioning                     │
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Model   │  │ Model   │  │ Model   │     │
│  │  v1.0   │  │  v1.1   │  │  v2.0   │     │
│  └─────────┘  └─────────┘  └────┬────┘     │
│                                  │           │
│                              (Active)        │
│                                              │
└──────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────┐
│              Logging Pipeline               │
│                                             │
│  Application Logs                           │
│       │                                     │
│       ▼                                     │
│  ┌─────────────┐                           │
│  │   Logging   │                           │
│  │  Aggregator │                           │
│  │ (ELK/Splunk)│                           │
│  └──────┬──────┘                           │
│         │                                   │
│         ▼                                   │
│  ┌─────────────┐                           │
│  │ Dashboards  │                           │
│  └─────────────┘                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              Metrics Collection             │
│                                             │
│  • Request count                            │
│  • Response time                            │
│  • Error rate                               │
│  • Prediction accuracy                      │
│  • Model performance                        │
│  • Resource usage                           │
│                                             │
│  Tools: Prometheus, Grafana, DataDog       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              Alerting System                │
│                                             │
│  Triggers:                                  │
│  • API downtime                             │
│  • High error rate (>5%)                    │
│  • Slow response time (>1s)                 │
│  • Model loading failure                    │
│  • Resource exhaustion                      │
│                                             │
│  Notifications: Email, Slack, PagerDuty    │
└─────────────────────────────────────────────┘
```

---

**Built for VoltEdge EV Fleet Management**
*Scalable, Secure, and Intelligent* 🚗⚡🤖
