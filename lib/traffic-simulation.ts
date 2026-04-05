// Traffic Simulation Engine
// Simulates real-time traffic data, sensors, and congestion patterns

export type CongestionLevel = "low" | "moderate" | "heavy";

export interface TrafficSensor {
  id: string;
  name: string;
  location: [number, number]; // [lng, lat]
  vehicleDensity: number; // 0-100
  averageSpeed: number; // km/h
  congestionLevel: CongestionLevel;
  lastUpdated: Date;
}

export interface TrafficSegment {
  id: string;
  coordinates: [number, number][];
  congestionLevel: CongestionLevel;
  averageSpeed: number;
  vehicleCount: number;
}

export interface RouteOption {
  id: string;
  name: string;
  type: "shortest" | "fastest" | "ai-optimized";
  distance: number; // km
  baseDuration: number; // minutes
  estimatedDuration: number; // minutes with traffic
  congestionLevel: CongestionLevel;
  coordinates: [number, number][];
  segments: TrafficSegment[];
  trafficDelay: number; // minutes
}

export interface TrafficPrediction {
  timestamp: Date;
  congestionLevel: CongestionLevel;
  vehicleDensity: number;
  averageSpeed: number;
  estimatedDelay: number; // minutes
  confidence: number; // 0-100
}

// Default center: New Delhi, India
export const DEFAULT_CENTER: [number, number] = [77.2090, 28.6139];

// Simulated traffic sensors across Delhi
export const TRAFFIC_SENSORS: TrafficSensor[] = [
  { id: "sensor-1", name: "Connaught Place", location: [77.2190, 28.6315], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-2", name: "India Gate", location: [77.2295, 28.6129], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-3", name: "Karol Bagh", location: [77.1903, 28.6519], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-4", name: "Lajpat Nagar", location: [77.2433, 28.5677], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-5", name: "Dwarka Sector 21", location: [77.0586, 28.5523], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-6", name: "Nehru Place", location: [77.2510, 28.5491], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-7", name: "Saket", location: [77.2167, 28.5245], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
  { id: "sensor-8", name: "Rohini Sector 7", location: [77.1074, 28.7041], vehicleDensity: 0, averageSpeed: 0, congestionLevel: "low", lastUpdated: new Date() },
];

// Time-based traffic multiplier
function getTimeBasedMultiplier(): number {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  
  let multiplier = 1;
  
  // Rush hour peaks
  if (hour >= 7 && hour <= 9) multiplier = 2.2;
  else if (hour >= 17 && hour <= 19) multiplier = 2.5;
  // Midday traffic
  else if (hour >= 10 && hour <= 16) multiplier = 1.5;
  // Night time
  else if (hour >= 21 || hour <= 6) multiplier = 0.3;
  else multiplier = 1;
  
  // Weekend reduction
  if (isWeekend) multiplier *= 0.7;
  
  return multiplier;
}

// Deterministic random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get congestion level from density
export function getCongestionLevel(density: number): CongestionLevel {
  if (density < 40) return "low";
  if (density < 70) return "moderate";
  return "heavy";
}

// Get speed from density
function getSpeedFromDensity(density: number): number {
  if (density < 40) return 50 + (40 - density) * 0.5; // 50-70 km/h
  if (density < 70) return 25 + (70 - density) * 0.5; // 25-40 km/h
  return Math.max(5, 25 - (density - 70) * 0.5); // 5-25 km/h
}

// Generate real-time sensor data
export function generateSensorData(): TrafficSensor[] {
  const now = Date.now();
  const multiplier = getTimeBasedMultiplier();
  
  return TRAFFIC_SENSORS.map((sensor, index) => {
    // Use time-based seed for consistent but changing values
    const seed = now / 30000 + index * 100; // Changes every 30 seconds
    const randomFactor = seededRandom(seed);
    
    // Base density with variation
    const baseDensity = 30 + randomFactor * 40;
    const density = Math.min(100, Math.max(0, baseDensity * multiplier + (randomFactor - 0.5) * 20));
    
    const averageSpeed = getSpeedFromDensity(density);
    const congestionLevel = getCongestionLevel(density);
    
    return {
      ...sensor,
      vehicleDensity: Math.round(density),
      averageSpeed: Math.round(averageSpeed),
      congestionLevel,
      lastUpdated: new Date(),
    };
  });
}

// Generate 24-hour traffic density data for charts
export function generate24HourTrafficData(): { hour: string; density: number; speed: number }[] {
  const data = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  for (let hour = 0; hour < 24; hour++) {
    let density: number;
    let speed: number;
    
    // Rush hour peaks
    if (hour >= 7 && hour <= 9) {
      density = 70 + Math.random() * 20;
    } else if (hour >= 17 && hour <= 19) {
      density = 75 + Math.random() * 20;
    } else if (hour >= 10 && hour <= 16) {
      density = 45 + Math.random() * 20;
    } else if (hour >= 21 || hour <= 6) {
      density = 10 + Math.random() * 15;
    } else {
      density = 30 + Math.random() * 20;
    }
    
    speed = getSpeedFromDensity(density);
    
    data.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      density: Math.round(density),
      speed: Math.round(speed),
    });
  }
  
  return data;
}

// Generate congestion distribution data for pie chart
export function getCongestionDistribution(sensors: TrafficSensor[]): { level: string; count: number; fill: string }[] {
  const counts = { low: 0, moderate: 0, heavy: 0 };
  
  sensors.forEach(sensor => {
    counts[sensor.congestionLevel]++;
  });
  
  return [
    { level: "Low Traffic", count: counts.low, fill: "var(--traffic-green)" },
    { level: "Moderate", count: counts.moderate, fill: "var(--traffic-yellow)" },
    { level: "Heavy", count: counts.heavy, fill: "var(--traffic-red)" },
  ];
}

// Simulate AI prediction (CNN-LSTM output)
export function generateAIPrediction(origin: [number, number], destination: [number, number]): TrafficPrediction {
  const now = new Date();
  const hour = now.getHours();
  const multiplier = getTimeBasedMultiplier();
  
  // Calculate distance-based factors
  const distance = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + 
    Math.pow(destination[1] - origin[1], 2)
  ) * 111; // Approximate km
  
  // Generate prediction
  const baseDensity = 40 * multiplier;
  const randomVariation = (Math.random() - 0.5) * 20;
  const vehicleDensity = Math.min(100, Math.max(0, baseDensity + randomVariation));
  
  const averageSpeed = getSpeedFromDensity(vehicleDensity);
  const congestionLevel = getCongestionLevel(vehicleDensity);
  
  // Estimate delay based on congestion
  const baseTime = (distance / 40) * 60; // minutes at 40 km/h
  const actualTime = (distance / averageSpeed) * 60;
  const estimatedDelay = Math.max(0, actualTime - baseTime);
  
  // Confidence based on time of day (higher during predictable hours)
  let confidence = 85;
  if (hour >= 7 && hour <= 9) confidence = 92;
  else if (hour >= 17 && hour <= 19) confidence = 90;
  else if (hour >= 22 || hour <= 5) confidence = 75;
  
  return {
    timestamp: now,
    congestionLevel,
    vehicleDensity: Math.round(vehicleDensity),
    averageSpeed: Math.round(averageSpeed),
    estimatedDelay: Math.round(estimatedDelay),
    confidence: Math.round(confidence + (Math.random() - 0.5) * 5),
  };
}

// Offset route coordinates to create visually distinct alternative routes
function offsetRouteCoordinates(
  coordinates: [number, number][],
  offsetAmount: number
): [number, number][] {
  if (coordinates.length < 2) return coordinates;
  
  return coordinates.map((coord, index) => {
    // Don't offset start and end points
    if (index === 0 || index === coordinates.length - 1) {
      return coord;
    }
    
    // Calculate perpendicular offset based on route direction
    const prev = coordinates[Math.max(0, index - 1)];
    const next = coordinates[Math.min(coordinates.length - 1, index + 1)];
    
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return coord;
    
    // Perpendicular direction
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Apply curved offset (stronger in middle of route)
    const t = index / (coordinates.length - 1);
    const curveMultiplier = Math.sin(t * Math.PI);
    
    return [
      coord[0] + perpX * offsetAmount * curveMultiplier,
      coord[1] + perpY * offsetAmount * curveMultiplier,
    ] as [number, number];
  });
}

// Fetch real road routes from Mapbox Directions API
export async function fetchRealRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteOption[]> {
  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destinationStr = `${destination[0]},${destination[1]}`;
    
    const response = await fetch(
      `/api/directions?origin=${originStr}&destination=${destinationStr}&alternatives=true`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch directions");
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      // Fallback to simulated routes
      return generateRoutes(origin, destination);
    }
    
    const multiplier = getTimeBasedMultiplier();
    
    // Map Mapbox routes to our RouteOption format
    const routes: RouteOption[] = data.routes.slice(0, 3).map((route: {
      geometry: { coordinates: [number, number][] };
      distance: number;
      duration: number;
    }, index: number) => {
      const distance = route.distance / 1000; // Convert to km
      const baseDuration = route.duration / 60; // Convert to minutes
      
      // Determine route type and congestion based on index
      let type: "shortest" | "fastest" | "ai-optimized";
      let name: string;
      let trafficDelay: number;
      let congestionLevel: CongestionLevel;
      
      if (index === 0) {
        type = "fastest";
        name = "Fastest Route";
        trafficDelay = Math.round(2 + multiplier * 4);
        congestionLevel = multiplier > 2 ? "moderate" : "low";
      } else if (index === 1) {
        type = "shortest";
        name = "Alternative Route";
        trafficDelay = Math.round(5 + multiplier * 8);
        congestionLevel = multiplier > 1.8 ? "heavy" : multiplier > 1.2 ? "moderate" : "low";
      } else {
        type = "ai-optimized";
        name = "AI Optimized";
        trafficDelay = Math.round(3 + multiplier * 3);
        congestionLevel = "low";
      }
      
      return {
        id: `route-${type}`,
        name,
        type,
        distance: Math.round(distance * 10) / 10,
        baseDuration: Math.round(baseDuration),
        estimatedDuration: Math.round(baseDuration + trafficDelay),
        congestionLevel,
        coordinates: route.geometry.coordinates as [number, number][],
        segments: [],
        trafficDelay,
      };
    });
    
    // If we only got 1-2 routes, generate additional route variants
    if (routes.length === 1) {
      // Add a second route variant with offset coordinates
      const baseCoords = routes[0].coordinates;
      routes.push({
        id: "route-alt",
        name: "Alternative Route",
        type: "shortest",
        distance: routes[0].distance * 1.1,
        baseDuration: routes[0].baseDuration * 1.1,
        estimatedDuration: Math.round(routes[0].baseDuration * 1.1 + 5 + multiplier * 6),
        congestionLevel: multiplier > 1.5 ? "moderate" : "low",
        coordinates: offsetRouteCoordinates(baseCoords, 0.008),
        segments: [],
        trafficDelay: Math.round(5 + multiplier * 6),
      });
    }
    
    if (routes.length < 3) {
      // Add AI optimized route with different offset
      const baseCoords = routes[0].coordinates;
      routes.push({
        id: "route-ai",
        name: "AI Optimized",
        type: "ai-optimized",
        distance: routes[0].distance * 1.05,
        baseDuration: routes[0].baseDuration,
        estimatedDuration: Math.round(routes[0].baseDuration + 3 + multiplier * 3),
        congestionLevel: "low",
        coordinates: offsetRouteCoordinates(baseCoords, -0.006),
        segments: [],
        trafficDelay: Math.round(3 + multiplier * 3),
      });
    }
    
    return routes;
  } catch (error) {
    console.error("Error fetching real routes:", error);
    // Fallback to simulated routes
    return generateRoutes(origin, destination);
  }
}

// Generate simulated routes (fallback)
export function generateRoutes(
  origin: [number, number],
  destination: [number, number]
): RouteOption[] {
  // Calculate approximate distance
  const directDistance = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + 
    Math.pow(destination[1] - origin[1], 2)
  ) * 111; // Approximate km
  
  const multiplier = getTimeBasedMultiplier();
  
  // Generate three route options
  const routes: RouteOption[] = [
    {
      id: "route-shortest",
      name: "Shortest Route",
      type: "shortest",
      distance: directDistance,
      baseDuration: (directDistance / 50) * 60,
      estimatedDuration: 0,
      congestionLevel: "moderate",
      coordinates: generateRoutePath(origin, destination, 0),
      segments: [],
      trafficDelay: 0,
    },
    {
      id: "route-fastest",
      name: "Fastest Route",
      type: "fastest",
      distance: directDistance * 1.15,
      baseDuration: (directDistance * 1.15 / 60) * 60,
      estimatedDuration: 0,
      congestionLevel: "low",
      coordinates: generateRoutePath(origin, destination, 1),
      segments: [],
      trafficDelay: 0,
    },
    {
      id: "route-ai",
      name: "AI Optimized",
      type: "ai-optimized",
      distance: directDistance * 1.08,
      baseDuration: (directDistance * 1.08 / 55) * 60,
      estimatedDuration: 0,
      congestionLevel: "low",
      coordinates: generateRoutePath(origin, destination, 2),
      segments: [],
      trafficDelay: 0,
    },
  ];
  
  // Apply traffic delays
  routes[0].trafficDelay = Math.round(5 + multiplier * 8);
  routes[0].estimatedDuration = Math.round(routes[0].baseDuration + routes[0].trafficDelay);
  routes[0].congestionLevel = multiplier > 1.8 ? "heavy" : multiplier > 1.2 ? "moderate" : "low";
  
  routes[1].trafficDelay = Math.round(2 + multiplier * 4);
  routes[1].estimatedDuration = Math.round(routes[1].baseDuration + routes[1].trafficDelay);
  routes[1].congestionLevel = multiplier > 2 ? "moderate" : "low";
  
  routes[2].trafficDelay = Math.round(3 + multiplier * 3);
  routes[2].estimatedDuration = Math.round(routes[2].baseDuration + routes[2].trafficDelay);
  routes[2].congestionLevel = "low";
  
  return routes;
}

// Generate a simulated route path with waypoints
function generateRoutePath(
  origin: [number, number],
  destination: [number, number],
  variant: number
): [number, number][] {
  const points: [number, number][] = [origin];
  const steps = 15; // More points for smoother curves
  
  // Calculate base offset based on distance
  const dx = destination[0] - origin[0];
  const dy = destination[1] - origin[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create waypoints with different variations for each route variant
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const baseX = origin[0] + dx * t;
    const baseY = origin[1] + dy * t;
    
    // Calculate perpendicular offset direction
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Different curve patterns for each variant
    let offset = 0;
    if (variant === 0) {
      // Shortest: slight curve one direction
      offset = Math.sin(t * Math.PI) * distance * 0.05;
    } else if (variant === 1) {
      // Fastest: takes a northern/western bypass
      offset = Math.sin(t * Math.PI) * distance * 0.15;
    } else {
      // AI optimized: takes a different path
      offset = -Math.sin(t * Math.PI * 1.2) * distance * 0.12;
    }
    
    // Add some "road-like" variations
    const roadNoise = Math.sin(t * Math.PI * 6) * distance * 0.01;
    
    points.push([
      baseX + perpX * (offset + roadNoise),
      baseY + perpY * (offset + roadNoise),
    ]);
  }
  
  points.push(destination);
  return points;
}

// Traffic trend prediction for the next 6 hours
export function getPredictedTrends(): { time: string; predicted: number; actual: number }[] {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < 6; i++) {
    const hour = (now.getHours() + i) % 24;
    let predicted: number;
    
    if (hour >= 7 && hour <= 9) predicted = 75 + Math.random() * 15;
    else if (hour >= 17 && hour <= 19) predicted = 80 + Math.random() * 15;
    else if (hour >= 10 && hour <= 16) predicted = 50 + Math.random() * 15;
    else if (hour >= 21 || hour <= 6) predicted = 15 + Math.random() * 10;
    else predicted = 35 + Math.random() * 15;
    
    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      predicted: Math.round(predicted),
      actual: i === 0 ? Math.round(predicted + (Math.random() - 0.5) * 10) : 0,
    });
  }
  
  return data;
}
