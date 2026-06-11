"""
Enhanced EV Range Prediction Model Training Script
Trains ElasticNet model and saves both model and scaler for production use
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import ElasticNet
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import os

# Configuration
DATA_PATH = r"C:\Users\HP\Desktop\EV_Fleet_City_Highway_25000.xlsx"
if not os.path.exists(DATA_PATH):
    DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'EV_Fleet_City_Highway_25000.xlsx')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..')
MODEL_PATH = os.path.join(MODEL_DIR, 'ev_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'ev_scaler.pkl')
ENCODERS_PATH = os.path.join(MODEL_DIR, 'ev_encoders.pkl')

def train_ev_model():
    """Train the EV range prediction model"""
    
    print("🚗 VoltEdge EV Range Prediction - Model Training")
    print("=" * 60)
    
    # 1. Load Data
    print("\n📂 Loading dataset...")
    df = pd.read_excel(DATA_PATH)
    print(f"   ✅ Loaded {len(df)} records")
    print(f"   Columns: {list(df.columns)}")
    
    # 2. Data Preprocessing
    print("\n🔧 Preprocessing data...")
    df['maintenance_status'] = df['maintenance_status'].fillna("Unknown")
    df['total_km_run'] = df['total_km_run'].astype(int)
    df['battery_percentage'] = df['battery_percentage'].astype(int)
    df['speed_kmph'] = df['speed_kmph'].astype(int)
    print("   ✅ Data types corrected")
    
    # 3. Encode Categorical Variables
    print("\n🏷️  Encoding categorical variables...")
    car_encoder = LabelEncoder()
    road_encoder = LabelEncoder()
    charging_encoder = LabelEncoder()
    maintenance_encoder = LabelEncoder()
    
    df['car_type_encoded'] = car_encoder.fit_transform(df['car_type'].astype(str))
    df['road_type_encoded'] = road_encoder.fit_transform(df['road_type'].astype(str))
    df['charging_status_encoded'] = charging_encoder.fit_transform(df['charging_status'].astype(str))
    df['maintenance_status_encoded'] = maintenance_encoder.fit_transform(df['maintenance_status'].astype(str))
    
    print(f"   Car types: {list(car_encoder.classes_)}")
    print(f"   Road types: {list(road_encoder.classes_)}")
    print(f"   Charging statuses: {list(charging_encoder.classes_)}")
    print(f"   Maintenance statuses: {list(maintenance_encoder.classes_)}")
    
    # 4. Extract car defaults
    print("\n🚙 Extracting car specifications...")
    df_temp = df.copy()
    df_temp['car_type_raw'] = car_encoder.inverse_transform(df['car_type_encoded'])
    
    car_defaults = df_temp.groupby('car_type_raw')[[
        'battery_capacity_kwh',
        'max_range_km',
        'vehicle_weight_kg',
        'motor_power_kw'
    ]].mean().to_dict(orient='index')
    
    for car, specs in car_defaults.items():
        print(f"   {car}:")
        for spec, value in specs.items():
            print(f"      {spec}: {value:.2f}")
    
    # 5. Prepare Features and Target
    print("\n📊 Preparing features and target...")
    feature_columns = [
        'car_type_encoded',
        'battery_capacity_kwh',
        'max_range_km',
        'vehicle_weight_kg',
        'motor_power_kw',
        'battery_percentage',
        'road_type_encoded',
        'speed_kmph',
        'charging_status_encoded',
        'maintenance_status_encoded',
        'total_km_run',
        'passenger_count'
    ]
    
    X = df[feature_columns]
    y = df['remaining_distance_km']
    
    print(f"   Features shape: {X.shape}")
    print(f"   Target shape: {y.shape}")
    print(f"   Target range: {y.min():.2f} - {y.max():.2f} km")
    
    # 6. Train-Test Split
    print("\n✂️  Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"   Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # 7. Feature Scaling
    print("\n⚖️  Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("   ✅ Features scaled")
    
    # 8. Train Model
    print("\n🎯 Training ElasticNet model...")
    model = ElasticNet(alpha=1.0, l1_ratio=0.5, random_state=42, max_iter=2000)
    model.fit(X_train_scaled, y_train)
    print("   ✅ Model trained")
    
    # 9. Evaluate Model
    print("\n📈 Evaluating model performance...")
    y_train_pred = model.predict(X_train_scaled)
    y_test_pred = model.predict(X_test_scaled)
    
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    test_mse = mean_squared_error(y_test, y_test_pred)
    test_rmse = np.sqrt(test_mse)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    
    print(f"\n   📊 Training Metrics:")
    print(f"      R² Score: {train_r2:.4f}")
    
    print(f"\n   📊 Test Metrics:")
    print(f"      R² Score: {test_r2:.4f}")
    print(f"      MSE: {test_mse:.2f}")
    print(f"      RMSE: {test_rmse:.2f} km")
    print(f"      MAE: {test_mae:.2f} km")
    
    # 10. Feature Importance
    print("\n🔍 Feature Importance:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'coefficient': model.coef_
    }).sort_values('coefficient', key=abs, ascending=False)
    
    for idx, row in feature_importance.head(5).iterrows():
        print(f"      {row['feature']}: {row['coefficient']:.4f}")
    
    # 11. Save Model, Scaler, and Encoders
    print("\n💾 Saving model artifacts...")
    
    # Save model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"   ✅ Model saved to: {MODEL_PATH}")
    
    # Save scaler
    with open(SCALER_PATH, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"   ✅ Scaler saved to: {SCALER_PATH}")
    
    # Save encoders and car defaults
    encoders_data = {
        'car_encoder': car_encoder,
        'road_encoder': road_encoder,
        'charging_encoder': charging_encoder,
        'maintenance_encoder': maintenance_encoder,
        'car_defaults': car_defaults,
        'feature_columns': feature_columns
    }
    
    with open(ENCODERS_PATH, 'wb') as f:
        pickle.dump(encoders_data, f)
    print(f"   ✅ Encoders saved to: {ENCODERS_PATH}")
    
    # 12. Test Prediction
    print("\n🧪 Testing sample prediction...")
    sample_input = {
        'car_type': 'Tata Punch EV',
        'battery_percentage': 80,
        'road_type': 'City',
        'speed_kmph': 60,
        'total_km_run': 15000,
        'passenger_count': 4
    }
    
    car_default = car_defaults[sample_input['car_type']]
    test_data = np.array([[
        car_encoder.transform([sample_input['car_type']])[0],
        car_default['battery_capacity_kwh'],
        car_default['max_range_km'],
        car_default['vehicle_weight_kg'],
        car_default['motor_power_kw'],
        sample_input['battery_percentage'],
        road_encoder.transform([sample_input['road_type']])[0],
        sample_input['speed_kmph'],
        0,  # charging status
        2,  # maintenance status
        sample_input['total_km_run'],
        sample_input['passenger_count']
    ]])
    
    test_data_scaled = scaler.transform(test_data)
    prediction = model.predict(test_data_scaled)
    
    print(f"\n   Sample Input: {sample_input}")
    print(f"   Predicted Range: {prediction[0]:.2f} km")
    
    print("\n" + "=" * 60)
    print("✅ Model training completed successfully!")
    print("=" * 60)
    
    return model, scaler, encoders_data


if __name__ == '__main__':
    try:
        model, scaler, encoders = train_ev_model()
        print("\n🎉 Ready for production use!")
        print("   Run the Flask API: python backend/app.py")
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
