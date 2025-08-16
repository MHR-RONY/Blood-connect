import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import "./BloodDropLoader.css";

interface BloodDropLoaderProps {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
	text?: string;
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-8 w-8",
	xl: "h-10 w-10"
};

export const BloodDropLoader = ({ className, size = "md", text }: BloodDropLoaderProps) => {
	return (
		<div className="flex items-center justify-center">
			<Droplets
				className={cn(
					sizeClasses[size],
					"blood-drop-spin",
					className
				)}
			/>
			{text && <span className="ml-2">{text}</span>}
		</div>
	);
};

export default BloodDropLoader;