import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ScanText, Image, Barcode } from "lucide-react";

interface SampleScannerProps {
  onScanTag: (tagData: string) => void;
  onScanBarcode: (barcode: string) => void;
  disabled: boolean;
}

export function SampleScanner({ onScanTag, onScanBarcode, disabled }: SampleScannerProps) {
  const [tagInput, setTagInput] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleScanTag = () => {
    if (tagInput.trim()) {
      onScanTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleScanBarcode = () => {
    if (barcodeInput.trim()) {
      onScanBarcode(barcodeInput.trim());
      setBarcodeInput("");
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScanTag();
    }
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScanBarcode();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Scan Sample Tag (OCR)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Scan or upload sample tag image"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            disabled={disabled}
          />
          <Button onClick={handleScanTag} disabled={disabled || !tagInput.trim()}>
            <ScanText className="w-4 h-4 mr-2" />
            Scan Tag
          </Button>
          <Button variant="outline" disabled={disabled}>
            <Image className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Scan Cylinder Barcode</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Scan cylinder barcode"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyPress={handleBarcodeKeyPress}
            disabled={disabled}
          />
          <Button onClick={handleScanBarcode} disabled={disabled || !barcodeInput.trim()}>
            <Barcode className="w-4 h-4 mr-2" />
            Scan
          </Button>
        </div>
      </div>
    </div>
  );
}
