import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SampleDetailsFormProps {
  cylinderNumber: string;
  producer: string;
  wellName: string;
  meterNumber: string;
  sampleType: string;
  flowRate: string;
  pressure: string;
  pressureUnit: string;
  temperature: string;
  fieldH2S: string;
  costCode: string;
  checkInType: "Cylinder" | "Bottle" | "CP Cylinder";
  billingReferenceType: string;
  billingReferenceNumber: string;
  remarks: string;
  onCylinderNumberChange: (value: string) => void;
  onProducerChange: (value: string) => void;
  onWellNameChange: (value: string) => void;
  onMeterNumberChange: (value: string) => void;
  onSampleTypeChange: (value: string) => void;
  onFlowRateChange: (value: string) => void;
  onPressureChange: (value: string) => void;
  onPressureUnitChange: (value: string) => void;
  onTemperatureChange: (value: string) => void;
  onFieldH2SChange: (value: string) => void;
  onCostCodeChange: (value: string) => void;
  onCheckInTypeChange: (value: "Cylinder" | "Bottle" | "CP Cylinder") => void;
  onBillingReferenceTypeChange: (value: string) => void;
  onBillingReferenceNumberChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
}

export function SampleDetailsForm({
  cylinderNumber,
  producer,
  wellName,
  meterNumber,
  sampleType,
  flowRate,
  pressure,
  pressureUnit,
  temperature,
  fieldH2S,
  costCode,
  checkInType,
  billingReferenceType,
  billingReferenceNumber,
  remarks,
  onCylinderNumberChange,
  onProducerChange,
  onWellNameChange,
  onMeterNumberChange,
  onSampleTypeChange,
  onFlowRateChange,
  onPressureChange,
  onPressureUnitChange,
  onTemperatureChange,
  onFieldH2SChange,
  onCostCodeChange,
  onCheckInTypeChange,
  onBillingReferenceTypeChange,
  onBillingReferenceNumberChange,
  onRemarksChange,
}: SampleDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Check-In Type as first entry */}
        <div className="space-y-2">
          <Label>Check-In Type</Label>
          <RadioGroup
            value={checkInType}
            onValueChange={(value: "Cylinder" | "Bottle" | "CP Cylinder") =>
              onCheckInTypeChange(value)
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cylinder" id="cylinder-type" />
              <Label htmlFor="cylinder-type" className="cursor-pointer">
                Cylinder
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Bottle" id="bottle-type" />
              <Label htmlFor="bottle-type" className="cursor-pointer">
                Bottle
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CP Cylinder" id="cp-cylinder-type" />
              <Label htmlFor="cp-cylinder-type" className="cursor-pointer">
                CP Cylinder
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Cylinder # moved to Producer's place */}
        <div className="space-y-2">
          <Label>Cylinder #</Label>
          <Input
            value={cylinderNumber}
            onChange={(e) => onCylinderNumberChange(e.target.value)}
            placeholder="Enter or scan cylinder number"
          />
        </div>

        {/* Producer moved below Cylinder # */}
        <div className="space-y-2">
          <Label>Producer</Label>
          <Input
            value={producer}
            onChange={(e) => onProducerChange(e.target.value)}
            placeholder="Producer"
          />
        </div>

        <div className="space-y-2">
          <Label>Well/Facility Name</Label>
          <Input
            value={wellName}
            onChange={(e) => onWellNameChange(e.target.value)}
            placeholder="Well/Facility name"
          />
        </div>

        <div className="space-y-2">
          <Label>Meter #</Label>
          <Input
            value={meterNumber}
            onChange={(e) => onMeterNumberChange(e.target.value)}
            placeholder="Meter number"
          />
        </div>

        <div className="space-y-2">
          <Label>Sample Type</Label>
          <RadioGroup
            value={sampleType}
            onValueChange={onSampleTypeChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spot" id="spot" />
              <Label htmlFor="spot" className="cursor-pointer">
                Spot
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="composite" id="composite" />
              <Label htmlFor="composite" className="cursor-pointer">
                Composite
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Flow Rate (MCFD)</Label>
          <Input
            value={flowRate}
            onChange={(e) => onFlowRateChange(e.target.value)}
            placeholder="Flow rate"
          />
        </div>

        <div className="space-y-2">
          <Label>Pressure</Label>
          <div className="flex items-center gap-4">
            <Input
              value={pressure}
              onChange={(e) => onPressureChange(e.target.value)}
              placeholder="Pressure"
              className="flex-1"
            />
            <RadioGroup
              value={pressureUnit}
              onValueChange={onPressureUnitChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PSIG" id="psig" />
                <Label htmlFor="psig" className="cursor-pointer">
                  PSIG
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PSIA" id="psia" />
                <Label htmlFor="psia" className="cursor-pointer">
                  PSIA
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Temp (F)</Label>
          <Input
            value={temperature}
            onChange={(e) => onTemperatureChange(e.target.value)}
            placeholder="Temperature"
          />
        </div>

        <div className="space-y-2">
          <Label>Field H2S (PPM)</Label>
          <Input
            value={fieldH2S}
            onChange={(e) => onFieldH2SChange(e.target.value)}
            placeholder="Field H2S"
          />
        </div>

        <div className="space-y-2">
          <Label>Cost Code</Label>
          <Input
            value={costCode}
            onChange={(e) => onCostCodeChange(e.target.value)}
            placeholder="Cost code"
          />
        </div>

        {/* ...existing code... */}

        <div className="space-y-2">
          <Label>Billing Ref</Label>
          <Select
            value={billingReferenceType}
            onValueChange={onBillingReferenceTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reference type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NA">NA</SelectItem>
              <SelectItem value="GL Code">GL Code</SelectItem>
              <SelectItem value="PO">PO</SelectItem>
              <SelectItem value="AFE#">AFE#</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Billing Ref No</Label>
          <Input
            value={billingReferenceNumber}
            onChange={(e) => onBillingReferenceNumberChange(e.target.value)}
            placeholder="Enter reference value"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remarks</Label>
        <Textarea
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Enter remarks..."
          rows={2}
        />
      </div>
    </div>
  );
}
