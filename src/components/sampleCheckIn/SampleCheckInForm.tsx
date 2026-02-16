import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { UserPlus, Plus } from "lucide-react";
import { Customer, Contact } from "../../services/sampleCheckInService";
import { analysisPricingService } from "../../services/analysisPricingService";

export interface SampleFormData {
  analysisNumber: string;
  analysisType: string;
  checkInType: "Cylinder" | "Sample";
  customerCylinder: boolean;
  rushed: boolean;
  date: string;
  producer: string;
  sampledBy: string;
  company: string;
  area: string;
  wellName: string;
  meterNumber: string;
  sampleType: string;
  flowRate: string;
  pressure: string;
  temperature: string;
  fieldH2S: string;
  costCode: string;
  cylinderNumber: string;
  remarks: string;
}

interface SampleCheckInFormProps {
  formData: SampleFormData;
  customerCode: string;
  selectedContact: string;
  customers: Customer[];
  contacts: Contact[];
  estimatedPrice: number;
  onFormChange: (data: Partial<SampleFormData>) => void;
  onCustomerChange: (code: string) => void;
  onContactChange: (contactId: string) => void;
  onAddCustomer: () => void;
  onAddContact: () => void;
}

export function SampleCheckInForm({
  formData,
  customerCode,
  selectedContact,
  customers,
  contacts,
  estimatedPrice,
  onFormChange,
  onCustomerChange,
  onContactChange,
  onAddCustomer,
  onAddContact,
}: SampleCheckInFormProps) {
  // Get active analysis types from pricing service
  const activeAnalysisTypes = analysisPricingService.getActiveAnalysisPrices();

  return (
    <div className="space-y-6">
      {/* Customer & Contact Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          <div className="flex gap-2">
            <Select value={customerCode} onValueChange={onCustomerChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.code} value={customer.code}>
                    {customer.name} ({customer.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={onAddCustomer}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contact Person</Label>
          <div className="flex gap-2">
            <Select
              value={selectedContact}
              onValueChange={onContactChange}
              disabled={!customerCode}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddContact}
              disabled={!customerCode}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Type & Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Analysis Type</Label>
          <Select
            value={formData.analysisType}
            onValueChange={(val: string) => onFormChange({ analysisType: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeAnalysisTypes.map((analysis) => (
                <SelectItem key={analysis.id} value={analysis.analysis_code}>
                  {analysis.analysis_code} - {analysis.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Check-In Type</Label>
          <RadioGroup
            value={formData.checkInType}
            onValueChange={(val: "Cylinder" | "Sample") =>
              onFormChange({ checkInType: val })
            }
          >
            <div className="flex gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Cylinder" id="cylinder" />
                <Label htmlFor="cylinder">Cylinder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sample" id="sample" />
                <Label htmlFor="sample">Sample</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customerCylinder"
                checked={formData.customerCylinder}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  onFormChange({ customerCylinder: checked === true })
                }
              />
              <Label htmlFor="customerCylinder" className="cursor-pointer">
                Customer Cylinder
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rushed"
                checked={formData.rushed}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  onFormChange({ rushed: checked === true })
                }
              />
              <Label htmlFor="rushed" className="cursor-pointer">
                Rushed (1.5x)
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Analysis Number</Label>
          <Input
            value={formData.analysisNumber}
            onChange={(e) => onFormChange({ analysisNumber: e.target.value })}
            placeholder="Enter analysis number"
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => onFormChange({ date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Cylinder Number</Label>
          <Input
            value={formData.cylinderNumber}
            onChange={(e) => onFormChange({ cylinderNumber: e.target.value })}
            placeholder="Enter cylinder number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Well Name</Label>
          <Input
            value={formData.wellName}
            onChange={(e) => onFormChange({ wellName: e.target.value })}
            placeholder="Enter well name"
          />
        </div>
        <div className="space-y-2">
          <Label>Meter Number</Label>
          <Input
            value={formData.meterNumber}
            onChange={(e) => onFormChange({ meterNumber: e.target.value })}
            placeholder="Enter meter number"
          />
        </div>
      </div>

      {/* Pricing Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Estimated Price:</span>
          <span className="text-xl font-bold text-blue-600">
            ${estimatedPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
