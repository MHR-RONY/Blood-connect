import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation } from "lucide-react";

interface LocationSelectorProps {
	onLocationChange: (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => void;
	className?: string;
}

const districts = [
	{
		name: "Dhaka",
		areas: ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Wari", "Old Dhaka", "Mohammadpur", "Mirpur", "Tejgaon", "Ramna"]
	},
	{
		name: "Chittagong",
		areas: ["Agrabad", "Kotwali", "Pahartali", "Bayazid", "Halishahar", "Panchlaish", "Khulshi", "Double Mooring"]
	},
	{
		name: "Sylhet",
		areas: ["Zindabazar", "Bandarbazar", "Subidbazar", "Chowhatta", "Amberkhana", "Dargah Gate", "Upashahar"]
	},
	{
		name: "Rajshahi",
		areas: ["Shaheb Bazar", "Laxmipur", "Rajpara", "Uposhahar", "Boalia", "Motihar", "Talaimari"]
	},
	{
		name: "Khulna",
		areas: ["Khalishpur", "Sonadanga", "Doulatpur", "Moylapota", "Khan Jahan Ali", "Rupsha", "Batiaghata"]
	},
	{
		name: "Barisal",
		areas: ["Sadar", "Kotwali", "Wazirpur", "Babuganj", "Muladi", "Hizla", "Gournadi"]
	},
	{
		name: "Rangpur",
		areas: ["Sadar", "Gangachara", "Kaunia", "Badarganj", "Mithapukur", "Pirganj", "Pirgachha"]
	},
	{
		name: "Mymensingh",
		areas: ["Sadar", "Muktagachha", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj"]
	},
	{
		name: "Comilla",
		areas: ["Sadar", "Laksam", "Chandina", "Chauddagram", "Daudkandi", "Homna", "Meghna"]
	},
	{
		name: "Bogra",
		areas: ["Sadar", "Sherpur", "Shibganj", "Sonatala", "Kahalu", "Nandigram", "Adamdighi"]
	}
];

const LocationSelector = ({ onLocationChange, className }: LocationSelectorProps) => {
	const [selectedCity, setSelectedCity] = useState("");
	const [selectedArea, setSelectedArea] = useState("");

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
							<SelectValue placeholder="Select District" />
						</SelectTrigger>
						<SelectContent>
							{districts.map((district) => (
								<SelectItem key={district.name} value={district.name}>
									{district.name}
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
							{selectedCity && districts.find(d => d.name === selectedCity)?.areas.map((area) => (
								<SelectItem key={area} value={area}>
									{area}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{selectedCity && selectedArea && (
					<div className="flex items-center text-sm text-muted-foreground bg-medical p-3 rounded-lg">
						<MapPin className="h-4 w-4 mr-2 text-primary" />
						Selected location: <span className="font-medium mx-1">{selectedArea}, {selectedCity}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default LocationSelector;