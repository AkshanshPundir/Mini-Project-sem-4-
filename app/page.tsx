"use client";

import { useState, useEffect, useCallback } from "react";
import { TrafficCone, MapPin, Navigation2, Route, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrafficMap } from "@/components/traffic/traffic-map";
import { SearchInput } from "@/components/navigation/search-input";
import { LocationButton } from "@/components/navigation/location-button";
import { PredictionPanel } from "@/components/dashboard/prediction-panel";
import { RouteComparison } from "@/components/dashboard/route-comparison";
import { AIRecommendationPanel } from "@/components/dashboard/ai-recommendation";
import { TrafficAnalytics } from "@/components/dashboard/traffic-analytics";
import { SensorStatus } from "@/components/dashboard/sensor-status";
import { MapControls } from "@/components/dashboard/map-controls";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  generateSensorData,
  generate24HourTrafficData,
  getCongestionDistribution,
  generateAIPrediction,
  fetchRealRoutes,
  getPredictedTrends,
  DEFAULT_CENTER,
  type TrafficSensor,
  type TrafficPrediction,
  type RouteOption,
} from "@/lib/traffic-simulation";
import { generateAIRecommendation, type AIRecommendation } from "@/lib/ai-prediction";

export default function TrafficDashboard() {
  // State
  const [sensors, setSensors] = useState<TrafficSensor[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; density: number; speed: number }[]>([]);
  const [predictedTrends, setPredictedTrends] = useState<{ time: string; predicted: number; actual: number }[]>([]);
  
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<TrafficPrediction | null>(null);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);
  const [hasCalculatedRoutes, setHasCalculatedRoutes] = useState(false);

  // Initialize and update sensor data
  useEffect(() => {
    const updateData = () => {
      setSensors(generateSensorData());
      setHourlyData(generate24HourTrafficData());
      setPredictedTrends(getPredictedTrends());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset routes when origin/destination change
  useEffect(() => {
    if (!origin || !destination) {
      setRoutes([]);
      setSelectedRoute(null);
      setPrediction(null);
      setAIRecommendation(null);
      setHasCalculatedRoutes(false);
    }
  }, [origin, destination]);

  // Find route handler - uses Mapbox Directions API for real road routes
  const handleFindRoute = useCallback(async () => {
    if (!origin || !destination) return;
    
    setIsCalculatingRoutes(true);
    
    try {
      // Fetch real road routes from Mapbox Directions API
      const newRoutes = await fetchRealRoutes(origin, destination);
      
      setRoutes(newRoutes);
      // Select the AI optimized or first available route
      const aiRoute = newRoutes.find(r => r.type === "ai-optimized") || newRoutes[0];
      if (aiRoute) {
        setSelectedRoute(aiRoute.id);
      }
      
      const newPrediction = generateAIPrediction(origin, destination);
      setPrediction(newPrediction);
      setHasCalculatedRoutes(true);
    } catch (error) {
      console.error("Error finding routes:", error);
    } finally {
      setIsCalculatingRoutes(false);
    }
  }, [origin, destination]);

  // Handle map click for destination
  const handleMapClick = useCallback((coords: [number, number]) => {
    if (!origin) {
      setOrigin(coords);
      setOriginSearch(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
    } else {
      setDestination(coords);
      setDestinationSearch(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
    }
  }, [origin]);

  // Handle location detection
  const handleLocationFound = useCallback((coords: [number, number]) => {
    setOrigin(coords);
    setOriginSearch("Current Location");
  }, []);

  // Handle AI recommendation generation
  const handleGenerateAIRecommendation = useCallback(() => {
    if (routes.length === 0) return;
    
    setIsAILoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const recommendation = generateAIRecommendation(routes, sensors);
      setAIRecommendation(recommendation);
      setIsAILoading(false);
    }, 1500);
  }, [routes, sensors]);

  // Handle route selection from AI
  const handleSelectRoute = useCallback((routeId: string) => {
    setSelectedRoute(routeId);
  }, []);

  // Get congestion distribution
  const congestionDistribution = getCongestionDistribution(sensors);

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrafficCone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Smart City Traffic System</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Congestion Prediction</p>
          </div>
        </div>
        
        {/* Navigation Search */}
        <div className="flex-1 flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>From:</span>
          </div>
          <div className="flex-1">
            <SearchInput
              placeholder="Starting point..."
              value={originSearch}
              onChange={setOriginSearch}
              onSelect={(result) => {
                setOrigin(result.coordinates);
                setOriginSearch(result.name);
              }}
              onClear={() => {
                setOrigin(null);
                setOriginSearch("");
              }}
            />
          </div>
          <LocationButton onLocationFound={handleLocationFound} />
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
            <Navigation2 className="h-3 w-3" />
            <span>To:</span>
          </div>
          <div className="flex-1">
            <SearchInput
              placeholder="Destination..."
              value={destinationSearch}
              onChange={setDestinationSearch}
              onSelect={(result) => {
                setDestination(result.coordinates);
                setDestinationSearch(result.name);
              }}
              onClear={() => {
                setDestination(null);
                setDestinationSearch("");
              }}
            />
          </div>
          
          {/* Find Route Button */}
          <Button
            onClick={handleFindRoute}
            disabled={!origin || !destination || isCalculatingRoutes}
            className="ml-2 gap-2"
          >
            {isCalculatingRoutes ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Route className="h-4 w-4" />
                <span>Find Route</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative min-w-0">
          <TrafficMap
            sensors={sensors}
            routes={routes}
            selectedRoute={selectedRoute}
            origin={origin}
            destination={destination}
            onMapClick={handleMapClick}
            showHeatmap={showHeatmap}
            showTrafficLayer={showTrafficLayer}
          />
          
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4">
            <MapControls
              showTrafficLayer={showTrafficLayer}
              onToggleTrafficLayer={setShowTrafficLayer}
              showHeatmap={showHeatmap}
              onToggleHeatmap={setShowHeatmap}
            />
          </div>

          {/* Instructions Overlay */}
          {(!origin || !destination || (origin && destination && !hasCalculatedRoutes)) && (
            <div className="absolute bottom-4 left-4 right-4 max-w-md">
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-sm">
                {!origin ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/10">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Step 1: Set your starting point</p>
                      <p className="text-muted-foreground mt-1">
                        Click on the map, use the search bar, or click the location button to set your origin.
                      </p>
                    </div>
                  </div>
                ) : !destination ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-red-500/10">
                      <Navigation2 className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Step 2: Set your destination</p>
                      <p className="text-muted-foreground mt-1">
                        Click on the map or use the search bar to set where you want to go.
                      </p>
                    </div>
                  </div>
                ) : !hasCalculatedRoutes ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Route className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Step 3: Find your route</p>
                      <p className="text-muted-foreground mt-1">
                        Click the &quot;Find Route&quot; button to calculate the best routes with AI-powered traffic predictions.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Sidebar */}
        <div className="w-[380px] border-l border-border/50 bg-card/30 flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Traffic Prediction */}
              <PredictionPanel prediction={prediction} />

              {/* Route Comparison */}
              <RouteComparison
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={handleSelectRoute}
              />

              {/* AI Recommendation */}
              {routes.length > 0 && (
                <AIRecommendationPanel
                  recommendation={aiRecommendation}
                  onGenerateRecommendation={handleGenerateAIRecommendation}
                  isLoading={isAILoading}
                  onSelectRoute={handleSelectRoute}
                />
              )}

              {/* Traffic Analytics */}
              <TrafficAnalytics
                hourlyData={hourlyData}
                congestionDistribution={congestionDistribution}
                predictedTrends={predictedTrends}
              />

              {/* Sensor Status */}
              <SensorStatus sensors={sensors} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
