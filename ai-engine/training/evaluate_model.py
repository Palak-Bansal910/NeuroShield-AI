import pandas as pd
import joblib
from sklearn.metrics import classification_report


# Load dataset
df = pd.read_csv(
    "ai-engine/datasets/synthetic_user_sessions.csv"
)

df["risk_label"] = df["risk_label"].map({
    "normal": 1,
    "fraud": -1
})

X = df.drop("risk_label", axis=1)
y = df["risk_label"]


# Load scaler
scaler = joblib.load(
    "ai-engine/trained_models/scaler.pkl"
)

X_scaled = scaler.transform(X)


# Load model
model = joblib.load(
    "ai-engine/trained_models/risk_model.pkl"
)


# Predict
predictions = model.predict(X_scaled)


# Evaluation
print(classification_report(y, predictions))