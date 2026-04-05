"use client";

import { Layers, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MapControlsProps {
  showTrafficLayer: boolean;
  onToggleTrafficLayer: (value: boolean) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (value: boolean) => void;
}

export function MapControls({
  showTrafficLayer,
  onToggleTrafficLayer,
  showHeatmap,
  onToggleHeatmap,
}: MapControlsProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="traffic-layer"
              checked={showTrafficLayer}
              onCheckedChange={onToggleTrafficLayer}
            />
            <Label
              htmlFor="traffic-layer"
              className="text-xs flex items-center gap-1 cursor-pointer"
            >
              <Layers className="h-3 w-3" />
              Traffic Layer
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={onToggleHeatmap}
            />
            <Label
              htmlFor="heatmap"
              className="text-xs flex items-center gap-1 cursor-pointer"
            >
              <Thermometer className="h-3 w-3" />
              Heatmap
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
