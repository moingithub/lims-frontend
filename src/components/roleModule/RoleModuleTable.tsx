import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import {
  RoleModule,
  roleModuleService,
} from "../../services/roleModuleService";
import { rolesService } from "../../services/rolesService";
import { modulesService } from "../../services/modulesService";

interface RoleModuleTableProps {
  permissions: RoleModule[];
  onEdit: (permission: RoleModule, index: number) => void;
  onDelete: (permission: RoleModule, index: number) => void;
}

export function RoleModuleTable({
  permissions,
  onEdit,
  onDelete,
}: RoleModuleTableProps) {
  const [roles, setRoles] = useState(rolesService.getRoles());
  const [modules, setModules] = useState(modulesService.getModules());

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        const data = await rolesService.fetchRoles();
        if (isMounted) setRoles(data);
      } catch {
        // Keep cached roles if fetch fails
      }
    };

    const loadModules = async () => {
      try {
        const data = await modulesService.fetchModules();
        if (isMounted) setModules(data);
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

  // Helper to get role name by ID
  const getRoleName = (roleId: number): string => {
    const role = roles.find((item) => item.id === roleId);
    return role ? role.role_name : `Role #${roleId}`;
  };

  // Helper to get module name by ID
  const getModuleName = (moduleId: number): string => {
    const module = modules.find((item) => item.id === moduleId);
    return module ? module.module_name : `Module #${moduleId}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Access Level</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission, index) => (
              <TableRow key={permission.id}>
                <TableCell>{getRoleName(permission.role_id)}</TableCell>
                <TableCell>{getModuleName(permission.module_id)}</TableCell>
                <TableCell>
                  <Badge
                    className={roleModuleService.getAccessLevelBadge(
                      permission.access_level,
                    )}
                    variant="outline"
                  >
                    {permission.access_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      permission.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {permission.active ? "True" : "False"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(permission, index)}
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(permission, index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
