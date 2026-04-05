"use client";

import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationButtonProps {
  onLocationFound: (coords: [number, number]) => void;
}

export function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        onLocationFound(coords);
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to Delhi center if geolocation fails
        onLocationFound([77.2090, 28.6139]);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleGetLocation}
      disabled={isLoading}
      className="bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
    </Button>
  );
}
