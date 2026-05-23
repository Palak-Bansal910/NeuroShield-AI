import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ==============================
# LOAD CREDIT CARD DATASET
# ==============================

df = pd.read_csv(
    "ai-engine/datasets/creditcard.csv"
)


# ==============================
# FEATURES
# ==============================

X = df.drop("Class", axis=1)


# ==============================
# SCALE DATA
# ==============================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ==============================
# TRAIN MODEL
# ==============================

model = IsolationForest(
    contamination=0.01,
    random_state=42
)

model.fit(X_scaled)


# ==============================
# SAVE MODEL
# ==============================

joblib.dump(
    model,
    "ai-engine/trained_models/transaction_model.pkl"
)

joblib.dump(
    scaler,
    "ai-engine/trained_models/transaction_scaler.pkl"
)


print("✅ Transaction fraud model trained")