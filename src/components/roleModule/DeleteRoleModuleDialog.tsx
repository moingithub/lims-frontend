import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { RoleModule } from "../../services/roleModuleService";
import { rolesService } from "../../services/rolesService";
import { modulesService } from "../../services/modulesService";

interface DeleteRoleModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: RoleModule | null;
  onConfirm: () => void;
}

export function DeleteRoleModuleDialog({
  open,
  onOpenChange,
  permission,
  onConfirm,
}: DeleteRoleModuleDialogProps) {
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

  // Helper to get role and module names
  const getPermissionInfo = (): string => {
    if (!permission) return "";

    const role = roles.find((item) => item.id === permission.role_id);
    const module = modules.find((item) => item.id === permission.module_id);

    const roleName = role ? role.role_name : `Role #${permission.role_id}`;
    const moduleName = module
      ? module.module_name
      : `Module #${permission.module_id}`;

    return `${roleName} - ${moduleName}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete Permission</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the permission for{" "}
            {getPermissionInfo()}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
