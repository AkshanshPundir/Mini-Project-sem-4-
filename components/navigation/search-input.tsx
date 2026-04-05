"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
}

export function SearchInput({
  placeholder = "Search location...",
  value,
  onChange,
  onSelect,
  onClear,
}: SearchInputProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Geocoding search
  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      // Fallback mock results for demo
      setResults([
        {
          id: "1",
          name: "Connaught Place",
          address: "New Delhi, Delhi, India",
          coordinates: [77.2190, 28.6315],
        },
        {
          id: "2",
          name: "India Gate",
          address: "Rajpath, New Delhi, India",
          coordinates: [77.2295, 28.6129],
        },
      ]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&country=IN&limit=5`
      );
      const data = await response.json();

      const searchResults: SearchResult[] = data.features?.map(
        (feature: { id: string; place_name: string; text: string; center: [number, number] }) => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          coordinates: feature.center as [number, number],
        })
      ) || [];

      setResults(searchResults);
    } catch (error) {
      console.error("Geocoding error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setShowResults(false);
    setResults([]);
  };

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary"
        />
        {isSearching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              onClear();
              setResults([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-start gap-2 transition-colors"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{result.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {result.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
