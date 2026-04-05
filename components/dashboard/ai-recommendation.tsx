"use client";

import { useState } from "react";
import { Sparkles, Clock, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AIRecommendation } from "@/lib/ai-prediction";

interface AIRecommendationPanelProps {
  recommendation: AIRecommendation | null;
  onGenerateRecommendation: () => void;
  isLoading: boolean;
  onSelectRoute: (routeId: string) => void;
}

export function AIRecommendationPanel({
  recommendation,
  onGenerateRecommendation,
  isLoading,
  onSelectRoute,
}: AIRecommendationPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Route Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!recommendation ? (
          <Button
            onClick={onGenerateRecommendation}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Routes...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Recommend Best Route
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-traffic-green/10 border border-traffic-green/30 rounded-lg p-2 text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-traffic-green" />
                <div className="text-lg font-semibold text-traffic-green">
                  {recommendation.estimatedTimeSaved} min
                </div>
                <div className="text-xs text-muted-foreground">Time Saved</div>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
                <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-semibold text-primary">
                  {recommendation.congestionAvoidance}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Less Congestion
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                <span>AI Analysis ({recommendation.confidence}% confident)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div
                className={`space-y-1 overflow-hidden transition-all ${
                  showDetails ? "max-h-40" : "max-h-12"
                }`}
              >
                {recommendation.reasoning.map((reason, idx) => (
                  <div
                    key={idx}
                    className="text-xs flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Predictions */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Predicted conditions:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">15m:</span>
                  <span
                    className={`capitalize ${
                      recommendation.predictedConditions.in15min === "low"
                        ? "text-traffic-green"
                        : recommendation.predictedConditions.in15min === "moderate"
                        ? "text-traffic-yellow"
                        : "text-traffic-red"
                    }`}
                  >
                    {recommendation.predictedConditions.in15min}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">30m:</span>
                  <span
                    className={`capitalize ${
                      recommendation.predictedConditions.in30min === "low"
                        ? "text-traffic-green"
                        : recommendation.predictedConditions.in30min === "moderate"
                        ? "text-traffic-yellow"
                        : "text-traffic-red"
                    }`}
                  >
                    {recommendation.predictedConditions.in30min}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Recommendation */}
            <Button
              onClick={() => onSelectRoute(recommendation.recommendedRoute)}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Apply AI Route
            </Button>

            {/* Regenerate */}
            <Button
              onClick={onGenerateRecommendation}
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              disabled={isLoading}
            >
              Refresh Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
