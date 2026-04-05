// Simulated CNN-LSTM AI Prediction Module
// Simulates deep learning model outputs for traffic prediction

import type { CongestionLevel, RouteOption, TrafficSensor } from "./traffic-simulation";

export interface AIRecommendation {
  recommendedRoute: string;
  confidence: number;
  reasoning: string[];
  estimatedTimeSaved: number; // minutes
  congestionAvoidance: number; // percentage
  weatherImpact: "none" | "light" | "moderate" | "severe";
  predictedConditions: {
    in15min: CongestionLevel;
    in30min: CongestionLevel;
    in1hour: CongestionLevel;
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainingDate: Date;
  totalPredictions: number;
}

// Simulated model metrics (would come from actual ML model in production)
export const MODEL_METRICS: ModelMetrics = {
  accuracy: 94.2,
  precision: 92.8,
  recall: 93.5,
  f1Score: 93.1,
  lastTrainingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  totalPredictions: 1247893,
};

// Simulate feature extraction (what CNN-LSTM would use)
interface TrafficFeatures {
  timeOfDay: number;
  dayOfWeek: number;
  isRushHour: boolean;
  historicalDensity: number;
  currentDensity: number;
  weatherCondition: number;
  eventFactor: number;
}

function extractFeatures(sensors: TrafficSensor[]): TrafficFeatures {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  const avgDensity = sensors.reduce((sum, s) => sum + s.vehicleDensity, 0) / sensors.length;
  
  return {
    timeOfDay: hour / 24,
    dayOfWeek: day / 7,
    isRushHour: (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19),
    historicalDensity: avgDensity * 0.9, // Simulated historical
    currentDensity: avgDensity,
    weatherCondition: 0.1, // Clear weather
    eventFactor: 0, // No special events
  };
}

// Simulate CNN-LSTM prediction
function runCNNLSTMPrediction(features: TrafficFeatures): {
  congestionProbabilities: { low: number; moderate: number; heavy: number };
  predictedDensity: number;
  confidence: number;
} {
  // Simulate neural network output
  const basePrediction = features.currentDensity;
  const rushHourBoost = features.isRushHour ? 15 : 0;
  const historicalTrend = (features.currentDensity - features.historicalDensity) * 0.3;
  
  const predictedDensity = Math.min(100, Math.max(0, 
    basePrediction + rushHourBoost + historicalTrend + (Math.random() - 0.5) * 10
  ));
  
  // Generate probabilities
  let lowProb: number, modProb: number, highProb: number;
  
  if (predictedDensity < 35) {
    lowProb = 0.7 + Math.random() * 0.2;
    modProb = 0.2 + Math.random() * 0.1;
    highProb = 1 - lowProb - modProb;
  } else if (predictedDensity < 65) {
    modProb = 0.6 + Math.random() * 0.2;
    lowProb = 0.25 + Math.random() * 0.1;
    highProb = 1 - lowProb - modProb;
  } else {
    highProb = 0.65 + Math.random() * 0.2;
    modProb = 0.25 + Math.random() * 0.1;
    lowProb = 1 - highProb - modProb;
  }
  
  // Confidence based on data quality
  const confidence = 85 + Math.random() * 10;
  
  return {
    congestionProbabilities: {
      low: Math.round(lowProb * 100) / 100,
      moderate: Math.round(modProb * 100) / 100,
      heavy: Math.round(highProb * 100) / 100,
    },
    predictedDensity: Math.round(predictedDensity),
    confidence: Math.round(confidence),
  };
}

// Generate AI route recommendation
export function generateAIRecommendation(
  routes: RouteOption[],
  sensors: TrafficSensor[]
): AIRecommendation {
  const features = extractFeatures(sensors);
  const prediction = runCNNLSTMPrediction(features);
  
  // Find the best route
  const sortedRoutes = [...routes].sort((a, b) => {
    // Score based on time and congestion
    const scoreA = a.estimatedDuration * (a.congestionLevel === "heavy" ? 1.5 : a.congestionLevel === "moderate" ? 1.2 : 1);
    const scoreB = b.estimatedDuration * (b.congestionLevel === "heavy" ? 1.5 : b.congestionLevel === "moderate" ? 1.2 : 1);
    return scoreA - scoreB;
  });
  
  const bestRoute = sortedRoutes[0];
  const worstRoute = sortedRoutes[sortedRoutes.length - 1];
  const timeSaved = Math.max(0, worstRoute.estimatedDuration - bestRoute.estimatedDuration);
  
  // Generate reasoning
  const reasoning: string[] = [];
  
  if (features.isRushHour) {
    reasoning.push("Rush hour traffic detected - avoiding main arterial roads");
  }
  
  if (bestRoute.type === "ai-optimized") {
    reasoning.push("AI model predicts optimal balance of distance and traffic flow");
    reasoning.push("Historical data shows 23% less congestion on this route at current time");
  } else if (bestRoute.type === "fastest") {
    reasoning.push("Current traffic conditions favor the expressway route");
    reasoning.push("Lower vehicle density detected on highway segments");
  } else {
    reasoning.push("Traffic conditions are favorable for the direct route");
    reasoning.push("No significant congestion detected on main roads");
  }
  
  if (prediction.predictedDensity > 60) {
    reasoning.push("CNN-LSTM model predicts increasing congestion in 15-30 minutes");
  } else {
    reasoning.push("Stable traffic conditions predicted for the next hour");
  }
  
  // Predict future conditions
  const getPredictedLevel = (offset: number): CongestionLevel => {
    const futureHour = (new Date().getHours() + offset) % 24;
    if (futureHour >= 7 && futureHour <= 9) return "heavy";
    if (futureHour >= 17 && futureHour <= 19) return "heavy";
    if (futureHour >= 10 && futureHour <= 16) return "moderate";
    return "low";
  };
  
  return {
    recommendedRoute: bestRoute.id,
    confidence: prediction.confidence,
    reasoning,
    estimatedTimeSaved: Math.round(timeSaved),
    congestionAvoidance: Math.round(30 + Math.random() * 40),
    weatherImpact: "none",
    predictedConditions: {
      in15min: prediction.predictedDensity > 55 ? "moderate" : "low",
      in30min: getPredictedLevel(0.5),
      in1hour: getPredictedLevel(1),
    },
  };
}

// Get model performance history
export function getModelPerformanceHistory(): { date: string; accuracy: number; predictions: number }[] {
  const data = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      accuracy: 90 + Math.random() * 8,
      predictions: Math.round(150000 + Math.random() * 50000),
    });
  }
  
  return data;
}
