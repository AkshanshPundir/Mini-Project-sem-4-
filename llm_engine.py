def generate_explanation(speed, volume, occupancy, prediction):

    if prediction == "High":
        return f"High congestion detected. Speed is low ({speed} km/h) and traffic volume is high ({volume}), indicating heavy traffic conditions."

    elif prediction == "Medium":
        return f"Moderate traffic observed. Speed ({speed} km/h) and volume ({volume}) indicate normal traffic flow with some congestion."

    else:
        return f"Low congestion. Vehicles are moving smoothly with speed {speed} km/h and lower traffic density."
