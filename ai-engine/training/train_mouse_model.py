import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ==============================
# LOAD DATASET
# ==============================

df = pd.read_csv(
    "ai-engine/datasets/synthetic_user_sessions.csv"
)


# ==============================
# SELECT MOUSE FEATURES
# ==============================

mouse_features = df[[
    "mouse_speed",
    "navigation_randomness",
    "rapid_switching"
]]


# ==============================
# SCALE FEATURES
# ==============================

scaler = StandardScaler()

mouse_scaled = scaler.fit_transform(
    mouse_features
)


# ==============================
# TRAIN MOUSE BEHAVIOR MODEL
# ==============================

mouse_model = IsolationForest(
    contamination=0.3,
    random_state=42
)

mouse_model.fit(mouse_scaled)


# ==============================
# SAVE MODEL & SCALER
# ==============================

joblib.dump(
    mouse_model,
    "ai-engine/trained_models/mouse_model.pkl"
)

joblib.dump(
    scaler,
    "ai-engine/trained_models/mouse_scaler.pkl"
)


print("✅ Mouse behavior model trained successfully")
print("✅ mouse_model.pkl saved")
print("✅ mouse_scaler.pkl saved")