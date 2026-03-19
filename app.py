from fastapi import FastAPI
from predictor import predict_congestion
from llm_engine import generate_explanation

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Traffic LLM System Running"}

@app.post("/predict")
def predict(data: dict):

    speed = data.get("speed")
    volume = data.get("volume")
    occupancy = data.get("occupancy")

    prediction = predict_congestion(speed, volume, occupancy)

    explanation = generate_explanation(speed, volume, occupancy, prediction)

    return {
        "prediction": prediction,
        "explanation": explanation
    }
