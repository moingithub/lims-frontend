import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RoleModule, roleModuleService } from "../services/roleModuleService";
import { SearchBar } from "../components/shared/SearchBar";
import { RoleModuleTable } from "../components/roleModule/RoleModuleTable";
import { AddRoleModuleDialog } from "../components/roleModule/AddRoleModuleDialog";
import { EditRoleModuleDialog } from "../components/roleModule/EditRoleModuleDialog";
import { DeleteRoleModuleDialog } from "../components/roleModule/DeleteRoleModuleDialog";

export function RoleModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<RoleModule | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    role_id: 0,
    module_id: 0,
    access_level: "",
    active: true,
  });

  // Reset form data
  const resetFormData = () => {
    setFormData({
      role_id: 0,
      module_id: 0,
      access_level: "",
      active: true,
    });
  };

  const [permissionsData, setPermissionsData] = useState<RoleModule[]>(
    roleModuleService.getPermissions(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPermissions = async () => {
      try {
        const permissions = await roleModuleService.fetchPermissions();
        if (isMounted) setPermissionsData(permissions);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load permissions";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter permissions based on search term
  const filteredPermissions = roleModuleService.searchPermissions(
    permissionsData,
    searchTerm,
  );

  const handleAdd = () => {
    resetFormData();
    setIsAddDialogOpen(true);
  };

  const handleFormChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (permission: RoleModule, index: number) => {
    setSelectedPermission(permission);
    setSelectedIndex(index);
    setFormData({
      role_id: permission.role_id,
      module_id: permission.module_id,
      access_level: permission.access_level,
      active: permission.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (permission: RoleModule, index: number) => {
    setSelectedPermission(permission);
    setSelectedIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPermission) return;

    try {
      await roleModuleService.deletePermission(selectedPermission.id);
      const updatedPermissions = permissionsData.filter(
        (item) => item.id !== selectedPermission.id,
      );
      setPermissionsData(updatedPermissions);
      roleModuleService.setPermissions(updatedPermissions);
      toast.success("Role-Module assignment deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedPermission(null);
      setSelectedIndex(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete permission";
      toast.error(message);
    }
  };

  const handleAddConfirm = async () => {
    const validation = roleModuleService.validatePermission(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid data");
      return;
    }

    // Check for duplicate role-module assignment
    if (
      roleModuleService.permissionExists(formData.role_id, formData.module_id)
    ) {
      toast.error("This Role-Module assignment already exists");
      return;
    }

    try {
      const addedPermission = await roleModuleService.addPermission({
        role_id: formData.role_id,
        module_id: formData.module_id,
        access_level: formData.access_level,
        active: formData.active,
      });
      const updatedPermissions = [...permissionsData, addedPermission];
      setPermissionsData(updatedPermissions);
      roleModuleService.setPermissions(updatedPermissions);
      toast.success("Role-Module assignment added successfully");
      setIsAddDialogOpen(false);
      resetFormData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create permission";
      toast.error(message);
    }
  };

  const handleEditConfirm = async () => {
    if (selectedIndex !== null && selectedPermission) {
      const validation = roleModuleService.validatePermission(formData);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid data");
        return;
      }

      const updatedPermission: RoleModule = {
        ...permissionsData[selectedIndex],
        role_id: formData.role_id,
        module_id: formData.module_id,
        access_level: formData.access_level,
        active: formData.active,
      };

      // Check for duplicate role-module assignment (excluding current one)
      if (
        roleModuleService.permissionExists(
          updatedPermission.role_id,
          updatedPermission.module_id,
          updatedPermission.id,
        )
      ) {
        toast.error("This Role-Module assignment already exists");
        return;
      }

      try {
        const updated = await roleModuleService.updatePermission(
          updatedPermission.id,
          updatedPermission,
        );
        const updatedPermissions = [...permissionsData];
        updatedPermissions[selectedIndex] = updated;
        setPermissionsData(updatedPermissions);
        roleModuleService.setPermissions(updatedPermissions);
        toast.success("Role-Module assignment updated successfully");
        setIsEditDialogOpen(false);
        setSelectedPermission(null);
        setSelectedIndex(null);
        resetFormData();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update permission";
        toast.error(message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Role Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search role-module assignments..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Permission
            </Button>
          </div>

          <RoleModuleTable
            permissions={isLoading ? [] : filteredPermissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <AddRoleModuleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={handleFormChange}
        onConfirm={handleAddConfirm}
      />

      <EditRoleModuleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={handleFormChange}
        onConfirm={handleEditConfirm}
      />

      <DeleteRoleModuleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        permission={selectedPermission}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
