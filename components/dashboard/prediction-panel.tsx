"use client";

import { Activity, Car, Gauge, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrafficPrediction } from "@/lib/traffic-simulation";

interface PredictionPanelProps {
  prediction: TrafficPrediction | null;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  if (!prediction) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Traffic Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select origin and destination to see predictions
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-traffic-green";
      case "moderate":
        return "text-traffic-yellow";
      case "heavy":
        return "text-traffic-red";
      default:
        return "text-muted-foreground";
    }
  };

  const getCongestionBg = (level: string) => {
    switch (level) {
      case "low":
        return "bg-traffic-green/10 border-traffic-green/30";
      case "moderate":
        return "bg-traffic-yellow/10 border-traffic-yellow/30";
      case "heavy":
        return "bg-traffic-red/10 border-traffic-red/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          AI Traffic Prediction
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {prediction.confidence}% confidence
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Congestion Level */}
        <div
          className={`rounded-lg border p-3 ${getCongestionBg(
            prediction.congestionLevel
          )}`}
        >
          <div className="text-xs text-muted-foreground mb-1">
            Predicted Congestion
          </div>
          <div
            className={`text-lg font-semibold capitalize ${getCongestionColor(
              prediction.congestionLevel
            )}`}
          >
            {prediction.congestionLevel} Traffic
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/30 rounded-lg p-2 text-center">
            <Car className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-semibold">
              {prediction.vehicleDensity}%
            </div>
            <div className="text-xs text-muted-foreground">Density</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 text-center">
            <Gauge className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-semibold">
              {prediction.averageSpeed}
            </div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-semibold">
              +{prediction.estimatedDelay}
            </div>
            <div className="text-xs text-muted-foreground">min delay</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
