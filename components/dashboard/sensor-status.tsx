"use client";

import { Radio, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TrafficSensor } from "@/lib/traffic-simulation";

interface SensorStatusProps {
  sensors: TrafficSensor[];
}

export function SensorStatus({ sensors }: SensorStatusProps) {
  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-traffic-green";
      case "moderate":
        return "bg-traffic-yellow";
      case "heavy":
        return "bg-traffic-red";
      default:
        return "bg-muted";
    }
  };

  const getCongestionTextColor = (level: string) => {
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

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          IoT Sensor Network
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {sensors.length} active sensors
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[140px] pr-3">
          <div className="grid grid-cols-2 gap-2">
            {sensors.map((sensor) => (
              <div
                key={sensor.id}
                className="bg-secondary/30 rounded-lg p-2 flex items-center gap-2"
              >
                <div className="relative">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${getCongestionColor(
                      sensor.congestionLevel
                    )}`}
                  />
                  <div
                    className={`absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping ${getCongestionColor(
                      sensor.congestionLevel
                    )} opacity-75`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {sensor.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{sensor.vehicleDensity}%</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{sensor.averageSpeed} km/h</span>
                  </div>
                </div>
                <Activity
                  className={`h-3 w-3 flex-shrink-0 ${getCongestionTextColor(
                    sensor.congestionLevel
                  )}`}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: just now</span>
          <span>Auto-refresh: 30s</span>
        </div>
      </CardContent>
    </Card>
  );
}
