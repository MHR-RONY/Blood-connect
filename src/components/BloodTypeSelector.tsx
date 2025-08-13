import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bloodTypes = [
  { type: "A+", compatible: ["A+", "AB+"] },
  { type: "A-", compatible: ["A+", "A-", "AB+", "AB-"] },
  { type: "B+", compatible: ["B+", "AB+"] },
  { type: "B-", compatible: ["B+", "B-", "AB+", "AB-"] },
  { type: "AB+", compatible: ["AB+"] },
  { type: "AB-", compatible: ["AB+", "AB-"] },
  { type: "O+", compatible: ["A+", "B+", "AB+", "O+"] },
  { type: "O-", compatible: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
];

interface BloodTypeSelectorProps {
  selectedType?: string;
  onSelect: (type: string) => void;
  label?: string;
  className?: string;
}

const BloodTypeSelector = ({ 
  selectedType, 
  onSelect, 
  label = "Select Blood Type",
  className 
}: BloodTypeSelectorProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {bloodTypes.map(({ type }) => (
          <Button
            key={type}
            type="button"
            variant={selectedType === type ? "default" : "outline"}
            className={cn(
              "h-12 text-base font-semibold transition-all",
              selectedType === type && "ring-2 ring-primary/20"
            )}
            onClick={(e) => {
              e.preventDefault();
              onSelect(type);
            }}
          >
            {type}
          </Button>
        ))}
      </div>
      {selectedType && (
        <div className="text-sm text-muted-foreground mt-2">
          <span className="font-medium">{selectedType}</span> blood can help:{" "}
          <span className="text-primary font-medium">
            {bloodTypes.find(bt => bt.type === selectedType)?.compatible.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
};

export default BloodTypeSelector;