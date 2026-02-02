import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Filter } from "lucide-react";

interface CylinderInventoryFiltersProps {
  statusFilter: string;
  locationFilter: string;
  statuses: string[];
  locations: string[];
  onStatusChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export function CylinderInventoryFilters({
  statusFilter,
  locationFilter,
  statuses,
  locations,
  onStatusChange,
  onLocationChange,
}: CylinderInventoryFiltersProps) {
  return (
    <>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={locationFilter} onValueChange={onLocationChange}>
        <SelectTrigger className="w-40">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
