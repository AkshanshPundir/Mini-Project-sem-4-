"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TrafficSensor, RouteOption } from "@/lib/traffic-simulation";
import { DEFAULT_CENTER } from "@/lib/traffic-simulation";

interface TrafficMapProps {
  sensors: TrafficSensor[];
  routes: RouteOption[];
  selectedRoute: string | null;
  origin: [number, number] | null;
  destination: [number, number] | null;
  onMapClick?: (coords: [number, number]) => void;
  showHeatmap: boolean;
  showTrafficLayer: boolean;
}

export function TrafficMap({
  sensors,
  routes,
  selectedRoute,
  origin,
  destination,
  onMapClick,
  showHeatmap,
  showTrafficLayer,
}: TrafficMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = token;

    // Suppress terrain/hillshade warning in fingerprinting-protected browsers
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('Terrain and hillshade are disabled')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: DEFAULT_CENTER,
      zoom: 11,
      pitch: 45,
      bearing: -10,
      // Disable terrain and hillshade to avoid Canvas2D fingerprinting issues
      // in private browsing or fingerprinting-protected browsers
      terrain: undefined,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.current.on("load", () => {
      setIsLoaded(true);

      // Add traffic layer source
      if (map.current) {
        map.current.addSource("mapbox-traffic", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-traffic-v1",
        });

        // Add heatmap source for congestion
        map.current.addSource("congestion-heatmap", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Add heatmap layer
        map.current.addLayer({
          id: "congestion-heatmap-layer",
          type: "heatmap",
          source: "congestion-heatmap",
          paint: {
            "heatmap-weight": ["get", "density"],
            "heatmap-intensity": 0.6,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 255, 0, 0)",
              0.3,
              "rgba(34, 197, 94, 0.6)",
              0.5,
              "rgba(234, 179, 8, 0.7)",
              0.7,
              "rgba(239, 68, 68, 0.8)",
              1,
              "rgba(185, 28, 28, 0.9)",
            ],
            "heatmap-radius": 40,
            "heatmap-opacity": 0.7,
          },
          layout: {
            visibility: "none",
          },
        });

        // Add routes source
        map.current.addSource("routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Add route layers - background for unselected routes
        map.current.addLayer({
          id: "route-background",
          type: "line",
          source: "routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#0f172a",
            "line-width": 12,
            "line-opacity": 0.9,
          },
        });

        // Colored route line
        map.current.addLayer({
          id: "route-line",
          type: "line",
          source: "routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["get", "selected"],
              "#3b82f6", // Blue for selected
              [
                "match",
                ["get", "congestion"],
                "low",
                "#22c55e",
                "moderate",
                "#eab308",
                "heavy",
                "#ef4444",
                "#64748b",
              ],
            ],
            "line-width": ["case", ["get", "selected"], 8, 5],
            "line-opacity": ["case", ["get", "selected"], 1, 0.7],
          },
        });

        // Add a dashed line for selected route to make it stand out
        map.current.addLayer({
          id: "route-selected-outline",
          type: "line",
          source: "routes",
          filter: ["==", ["get", "selected"], true],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-opacity": 0.5,
            "line-dasharray": [2, 2],
          },
        });
      }
    });

    map.current.on("click", (e) => {
      if (onMapClick) {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    return () => {
      // Restore original console.warn
      console.warn = originalWarn;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapClick]);

  // Update heatmap visibility
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    map.current.setLayoutProperty(
      "congestion-heatmap-layer",
      "visibility",
      showHeatmap ? "visible" : "none"
    );
  }, [showHeatmap, isLoaded]);

  // Update traffic layer
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const trafficLayerId = "traffic-layer";

    if (showTrafficLayer) {
      if (!map.current.getLayer(trafficLayerId)) {
        map.current.addLayer({
          id: trafficLayerId,
          type: "line",
          source: "mapbox-traffic",
          "source-layer": "traffic",
          paint: {
            "line-width": 2,
            "line-color": [
              "match",
              ["get", "congestion"],
              "low",
              "#22c55e",
              "moderate",
              "#eab308",
              "heavy",
              "#ef4444",
              "severe",
              "#b91c1c",
              "#6b7280",
            ],
          },
        });
      }
    } else {
      if (map.current.getLayer(trafficLayerId)) {
        map.current.removeLayer(trafficLayerId);
      }
    }
  }, [showTrafficLayer, isLoaded]);

  // Update heatmap data from sensors
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource("congestion-heatmap") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features = sensors.map((sensor) => ({
      type: "Feature" as const,
      properties: {
        density: sensor.vehicleDensity / 100,
      },
      geometry: {
        type: "Point" as const,
        coordinates: sensor.location,
      },
    }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [sensors, isLoaded]);

  // Update routes on map
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource("routes") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features = routes.map((route) => ({
      type: "Feature" as const,
      properties: {
        id: route.id,
        congestion: route.congestionLevel,
        selected: route.id === selectedRoute,
      },
      geometry: {
        type: "LineString" as const,
        coordinates: route.coordinates,
      },
    }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [routes, selectedRoute, isLoaded]);

  // Update markers
  const updateMarkers = useCallback(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!map.current) return;

    // Add origin marker
    if (origin) {
      const el = document.createElement("div");
      el.className = "origin-marker";
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
          </svg>
        </div>
      `;
      const marker = new mapboxgl.Marker(el).setLngLat(origin).addTo(map.current);
      markersRef.current.push(marker);
    }

    // Add destination marker
    if (destination) {
      const el = document.createElement("div");
      el.className = "destination-marker";
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      `;
      const marker = new mapboxgl.Marker(el).setLngLat(destination).addTo(map.current);
      markersRef.current.push(marker);
    }

    // Add sensor markers
    sensors.forEach((sensor) => {
      const el = document.createElement("div");
      el.className = "sensor-marker";
      const color =
        sensor.congestionLevel === "low"
          ? "#22c55e"
          : sensor.congestionLevel === "moderate"
          ? "#eab308"
          : "#ef4444";
      el.innerHTML = `
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-md animate-pulse" style="background-color: ${color}"></div>
      `;
      const marker = new mapboxgl.Marker(el)
        .setLngLat(sensor.location)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2 text-sm">
              <div class="font-semibold">${sensor.name}</div>
              <div>Density: ${sensor.vehicleDensity}%</div>
              <div>Speed: ${sensor.averageSpeed} km/h</div>
            </div>
          `)
        )
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [origin, destination, sensors]);

  useEffect(() => {
    if (isLoaded) {
      updateMarkers();
    }
  }, [isLoaded, updateMarkers]);

  // Fit bounds when routes change
  useEffect(() => {
    if (!map.current || !isLoaded || routes.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    routes.forEach((route) => {
      route.coordinates.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });
    });

    if (origin) bounds.extend(origin);
    if (destination) bounds.extend(destination);

    map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
  }, [routes, origin, destination, isLoaded]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
            <p className="text-muted-foreground text-sm">
              Please add your NEXT_PUBLIC_MAPBOX_TOKEN environment variable to enable the map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
