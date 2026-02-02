import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cylinderTypes, trackInventoryOptions, locationOptions } from "../../services/cylinderMasterService";

export interface CylinderFormData {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  track_inventory: string;
  location: string;
  active: boolean;
  created_by?: number;
}

interface CylinderMasterFormProps {
  formData: CylinderFormData;
  onChange: (data: CylinderFormData) => void;
}

export function CylinderMasterForm({ formData, onChange }: CylinderMasterFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cylinder-number">Cylinder Number *</Label>
          <Input
            id="cylinder-number"
            placeholder="e.g., SN-12345"
            value={formData.cylinder_number}
            onChange={(e) => onChange({ ...formData, cylinder_number: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cylinder-type">Cylinder Type *</Label>
          <Select
            value={formData.cylinder_type}
            onValueChange={(val) => onChange({ ...formData, cylinder_type: val })}
          >
            <SelectTrigger id="cylinder-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {cylinderTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="track-inventory">Track Inventory *</Label>
          <Select
            value={formData.track_inventory}
            onValueChange={(val) => onChange({ ...formData, track_inventory: val })}
          >
            <SelectTrigger id="track-inventory">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {trackInventoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Select
            value={formData.location}
            onValueChange={(val) => onChange({ ...formData, location: val })}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="active">Active</Label>
          <Select
            value={formData.active ? "active" : "inactive"}
            onValueChange={(val) => onChange({ ...formData, active: val === "active" })}
          >
            <SelectTrigger id="active">
              <SelectValue>
                {formData.active ? "True" : "False"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">True</SelectItem>
              <SelectItem value="inactive">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}