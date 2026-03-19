import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load dataset
import pandas as pd

df = pd.read_csv("dataset.csv", encoding="ISO-8859-1", on_bad_lines='skip')

print(df.columns)

# Features & Target
X = df[["speed_kmh", "vehicle_volume", "occupancy_percent"]]
y = df["congestion_level"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Accuracy
accuracy = model.score(X_test, y_test)
print("Model Accuracy:", accuracy)

# Save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model saved as model.pkl")
