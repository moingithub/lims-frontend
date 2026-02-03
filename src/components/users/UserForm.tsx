import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { rolesService } from "../../services/rolesService";

export interface UserFormData {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  active: boolean;
  created_by: number;
}

interface UserFormProps {
  formData: UserFormData;
  onChange: (data: UserFormData) => void;
  requirePassword?: boolean;
}

export function UserForm({
  formData,
  onChange,
  requirePassword = true,
}: UserFormProps) {
  const [roles, setRoles] = useState(rolesService.getActiveRoles());

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        const allRoles = await rolesService.fetchRoles();
        if (isMounted) {
          setRoles(allRoles.filter((role) => role.active));
        }
      } catch {
        // Keep cached roles if fetch fails
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input
          placeholder="Enter name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Email *</Label>
        <Input
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{requirePassword ? "Password *" : "Password"}</Label>
        <Input
          type="password"
          placeholder={
            requirePassword
              ? "Enter password (min 6 characters)"
              : "Leave blank to keep current password"
          }
          value={formData.password}
          onChange={(e) => onChange({ ...formData, password: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Role *</Label>
        <Select
          value={formData.role_id.toString()}
          onValueChange={(val) =>
            onChange({ ...formData, role_id: parseInt(val) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Active</Label>
        <Select
          value={formData.active ? "active" : "inactive"}
          onValueChange={(val) =>
            onChange({ ...formData, active: val === "active" })
          }
        >
          <SelectTrigger>
            <SelectValue>{formData.active ? "True" : "False"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">True</SelectItem>
            <SelectItem value="inactive">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
