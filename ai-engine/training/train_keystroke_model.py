import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ==============================
# LOAD DATASET
# ==============================

df = pd.read_csv(
    "ai-engine/datasets/DSL-StrongPasswordData.csv"
)


# ==============================
# SELECT ONLY NUMERIC FEATURES
# ==============================

numeric_df = df.select_dtypes(
    include=['float64', 'int64']
)


# ==============================
# HANDLE MISSING VALUES
# ==============================

numeric_df = numeric_df.fillna(0)


# ==============================
# SCALE FEATURES
# ==============================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(
    numeric_df
)


# ==============================
# TRAIN KEYSTROKE MODEL
# ==============================

model = IsolationForest(
    contamination=0.1,
    random_state=42
)

model.fit(X_scaled)


# ==============================
# SAVE MODEL & SCALER
# ==============================

joblib.dump(
    model,
    "ai-engine/trained_models/keystroke_model.pkl"
)

joblib.dump(
    scaler,
    "ai-engine/trained_models/keystroke_scaler.pkl"
)


print("✅ Keystroke AI model trained successfully")
print("✅ keystroke_model.pkl saved")
print("✅ keystroke_scaler.pkl saved")