import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { roleModuleService } from "../../services/roleModuleService";
import { rolesService } from "../../services/rolesService";
import { modulesService } from "../../services/modulesService";

export interface RoleModuleFormData {
  role_id: number;
  module_id: number;
  access_level: string;
  active: boolean;
}

interface RoleModuleFormProps {
  formData: RoleModuleFormData;
  onChange: (field: string, value: string | number | boolean) => void;
}

export function RoleModuleForm({ formData, onChange }: RoleModuleFormProps) {
  const [roles, setRoles] = useState(rolesService.getActiveRoles());
  const [modules, setModules] = useState(modulesService.getActiveModules());
  const accessLevels = roleModuleService.getAccessLevels();

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

    const loadModules = async () => {
      try {
        const allModules = await modulesService.fetchModules();
        if (isMounted) {
          setModules(allModules.filter((module) => module.active));
        }
      } catch {
        // Keep cached modules if fetch fails
      }
    };

    loadRoles();
    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="add-role">Role *</Label>
        <Select
          value={formData.role_id.toString()}
          onValueChange={(val) => onChange("role_id", parseInt(val))}
        >
          <SelectTrigger id="add-role">
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
        <Label htmlFor="add-module">Module *</Label>
        <Select
          value={formData.module_id.toString()}
          onValueChange={(val) => onChange("module_id", parseInt(val))}
        >
          <SelectTrigger id="add-module">
            <SelectValue placeholder="Select a module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.id} value={module.id.toString()}>
                {module.module_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="add-access-level">Access Level *</Label>
        <Select
          value={formData.access_level}
          onValueChange={(val) => onChange("access_level", val)}
        >
          <SelectTrigger id="add-access-level">
            <SelectValue placeholder="Select access level" />
          </SelectTrigger>
          <SelectContent>
            {accessLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="add-active">Active *</Label>
        <Select
          id="add-active"
          value={formData.active ? "active" : "inactive"}
          onValueChange={(val) => onChange("active", val === "active")}
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
