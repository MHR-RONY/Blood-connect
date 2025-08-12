import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloodDropIconProps {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-8 w-8",
	xl: "h-10 w-10"
};

export const BloodDropIcon = ({ className, size = "md" }: BloodDropIconProps) => {
	return (
		<Droplets
			className={cn(
				sizeClasses[size],
				"text-primary",
				className
			)}
		/>
	);
};

export default BloodDropIcon;
