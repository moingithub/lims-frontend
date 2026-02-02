import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Plus, AlertCircle } from "lucide-react";

interface CylinderScannerProps {
  onScan: (barcode: string) => void | Promise<void>;
  disabled: boolean;
}

export function CylinderScanner({ onScan, disabled }: CylinderScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleScan = async () => {
    if (barcodeInput.trim()) {
      await onScan(barcodeInput.trim());
      setBarcodeInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Scan Cylinder Barcode / Cylinder Number</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter or scan cylinder number..."
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <Button
          onClick={handleScan}
          disabled={disabled || !barcodeInput.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      {disabled && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>Please select a company first before scanning cylinders</span>
        </div>
      )}
      {!disabled && (
        <div className="text-xs text-muted-foreground">
          💡 Cylinder number must exist in Cylinder Master
        </div>
      )}
    </div>
  );
}
