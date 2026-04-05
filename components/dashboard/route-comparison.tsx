"use client";

import { Route, Clock, MapPin, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RouteOption } from "@/lib/traffic-simulation";

interface RouteComparisonProps {
  routes: RouteOption[];
  selectedRoute: string | null;
  onSelectRoute: (routeId: string) => void;
}

export function RouteComparison({
  routes,
  selectedRoute,
  onSelectRoute,
}: RouteComparisonProps) {
  const getRouteIcon = (type: string) => {
    switch (type) {
      case "shortest":
        return <MapPin className="h-4 w-4" />;
      case "fastest":
        return <Clock className="h-4 w-4" />;
      case "ai-optimized":
        return <Zap className="h-4 w-4" />;
      default:
        return <Route className="h-4 w-4" />;
    }
  };

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

  const getCongestionBorder = (level: string) => {
    switch (level) {
      case "low":
        return "border-traffic-green/50";
      case "moderate":
        return "border-traffic-yellow/50";
      case "heavy":
        return "border-traffic-red/50";
      default:
        return "border-border";
    }
  };

  if (routes.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            Route Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set your destination to compare routes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Route className="h-4 w-4 text-primary" />
          Route Options
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {routes.length} routes found
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {routes.map((route) => (
          <Button
            key={route.id}
            variant={selectedRoute === route.id ? "secondary" : "ghost"}
            className={`w-full justify-start h-auto p-3 ${
              selectedRoute === route.id
                ? `border-2 ${getCongestionBorder(route.congestionLevel)}`
                : "border border-border/50"
            }`}
            onClick={() => onSelectRoute(route.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <div
                className={`p-2 rounded-md ${
                  route.type === "ai-optimized"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-foreground"
                }`}
              >
                {getRouteIcon(route.type)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{route.name}</span>
                  {route.type === "ai-optimized" && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{route.distance.toFixed(1)} km</span>
                  <span>{route.estimatedDuration} min</span>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getCongestionColor(
                        route.congestionLevel
                      )}`}
                    />
                    <span className="capitalize">{route.congestionLevel}</span>
                  </div>
                </div>
                {route.trafficDelay > 0 && (
                  <div className="text-xs text-traffic-yellow mt-1">
                    +{route.trafficDelay} min traffic delay
                  </div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
