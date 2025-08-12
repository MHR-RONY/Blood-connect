import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation } from "lucide-react";

interface LocationSelectorProps {
  onLocationChange: (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => void;
  className?: string;
}

const cities = [
  {
    name: "New York",
    areas: ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]
  },
  {
    name: "Los Angeles", 
    areas: ["Downtown", "Hollywood", "Beverly Hills", "Santa Monica", "Venice"]
  },
  {
    name: "Chicago",
    areas: ["Downtown", "North Side", "South Side", "West Side", "Lincoln Park"]
  },
  {
    name: "Houston",
    areas: ["Downtown", "Midtown", "River Oaks", "The Heights", "Montrose"]
  },
  {
    name: "Phoenix",
    areas: ["Downtown", "Scottsdale", "Tempe", "Mesa", "Glendale"]
  }
];

const LocationSelector = ({ onLocationChange, className }: LocationSelectorProps) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [searchRadius, setSearchRadius] = useState("10");

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedArea("");
    if (city) {
      onLocationChange({ city, area: "" });
    }
  };

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    if (selectedCity && area) {
      onLocationChange({ city: selectedCity, area });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange({
            city: "Current Location",
            area: "GPS Location",
            coordinates: { lat: latitude, lng: longitude }
          });
          setSelectedCity("Current Location");
          setSelectedArea("GPS Location");
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Location</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={getCurrentLocation}
            className="text-primary hover:text-primary/80"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Use Current Location
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedArea} 
            onValueChange={handleAreaChange}
            disabled={!selectedCity || selectedCity === "Current Location"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              {selectedCity && cities.find(c => c.name === selectedCity)?.areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Search Radius</label>
          <Select value={searchRadius} onValueChange={setSearchRadius}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedCity && selectedArea && (
          <div className="flex items-center text-sm text-muted-foreground bg-medical p-3 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            Searching in <span className="font-medium mx-1">{selectedArea}, {selectedCity}</span> 
            within <span className="font-medium mx-1">{searchRadius} km</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;