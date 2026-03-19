import pickle
import numpy as np

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

def predict_congestion(speed, volume, occupancy):
    data = np.array([[speed, volume, occupancy]])
    prediction = model.predict(data)[0]
    return prediction
