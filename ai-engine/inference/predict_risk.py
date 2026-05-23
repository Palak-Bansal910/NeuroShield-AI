import joblib
import numpy as np


# ==============================
# LOAD TRAINED MODEL & SCALER
# ==============================

model = joblib.load(
    "ai-engine/trained_models/risk_model.pkl"
)

scaler = joblib.load(
    "ai-engine/trained_models/scaler.pkl"
)


# ==============================
# PREDICT RISK FUNCTION
# ==============================

def predict_risk(features):

    data = np.array([[
        features["typing_speed"],
        features["hesitation_time"],
        features["backspace_count"],
        features["mouse_speed"],
        features["navigation_randomness"],
        features["transaction_amount"],
        features["otp_view_count"],
        features["rapid_switching"]
    ]])

    # Scale input data
    data_scaled = scaler.transform(data)

    # Predict anomaly
    prediction = model.predict(data_scaled)

    # HIGH RISK
    if prediction[0] == -1:

        return {
            "risk_level": "HIGH RISK",
            "trust_score": 25,
            "recommended_action": "Trigger Secondary Verification"
        }

    # LOW RISK
    return {
        "risk_level": "LOW RISK",
        "trust_score": 92,
        "recommended_action": "Allow Transaction"
    }


# ==============================
# TEST SAMPLE USER
# ==============================

sample_user = {
    "typing_speed": 4.5,
    "hesitation_time": 1,
    "backspace_count": 1,
    "mouse_speed": 120,
    "navigation_randomness": 0.1,
    "transaction_amount": 2500,
    "otp_view_count": 1,
    "rapid_switching": 0
}


result = predict_risk(sample_user)

print(result)