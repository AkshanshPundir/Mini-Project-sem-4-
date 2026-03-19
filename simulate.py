import requests
import random
import time

while True:
    data = {
        "speed": random.randint(10, 70),
        "volume": random.randint(50, 300),
        "occupancy": random.randint(10, 80)
    }

    response = requests.post(
        "http://127.0.0.1:8000/predict",
        json=data
    )

    print(response.json())

    time.sleep(5)
