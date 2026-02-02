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
import { Role, rolesService } from "../services/rolesService";
import { SearchBar } from "../components/shared/SearchBar";
import { RolesTable } from "../components/roles/RolesTable";
import { AddRoleDialog } from "../components/roles/AddRoleDialog";
import { EditRoleDialog } from "../components/roles/EditRoleDialog";
import { DeleteRoleDialog } from "../components/roles/DeleteRoleDialog";
import { RoleFormData } from "../components/roles/RoleForm";

export function Roles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState<RoleFormData>({
    id: 0,
    role_name: "",
    description: "",
    active: false,
    created_by: 1,
  });

  const [rolesData, setRolesData] = useState<Role[]>(rolesService.getRoles());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        const roles = await rolesService.fetchRoles();
        if (isMounted) setRolesData(roles);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load roles";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = rolesService.searchRoles(rolesData, searchTerm);

  const handleAdd = () => {
    setFormData({
      id: 0,
      role_name: "",
      description: "",
      active: false,
      created_by: 1,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      id: role.id,
      role_name: role.role_name,
      description: role.description,
      active: role.active,
      created_by: role.created_by,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = rolesService.validateRole(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    try {
      const createdRole = await rolesService.addRole({
        role_name: formData.role_name,
        description: formData.description,
        active: formData.active,
      });
      setRolesData([...rolesData, createdRole]);
      rolesService.setRoles([...rolesData, createdRole]);
      toast.success(`Role "${createdRole.role_name}" added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create role");
    }
  };

  const confirmEdit = async () => {
    const validation = rolesService.validateRole(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    if (!selectedRole) return;

    try {
      const savedRole = await rolesService.updateRole(selectedRole.id, {
        id: selectedRole.id,
        role_name: formData.role_name,
        description: formData.description,
        active: formData.active,
      });
      const updatedRoles = rolesData.map((item) =>
        item.id === selectedRole.id ? savedRole : item,
      );
      setRolesData(updatedRoles);
      rolesService.setRoles(updatedRoles);
      toast.success(`Role "${savedRole.role_name}" updated successfully`);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const confirmDelete = async () => {
    if (selectedRole) {
      try {
        await rolesService.deleteRole(selectedRole.id);
        const updatedRoles = rolesData.filter(
          (item) => item.id !== selectedRole.id,
        );
        setRolesData(updatedRoles);
        rolesService.setRoles(updatedRoles);
        toast.success(`Role "${selectedRole.role_name}" deleted successfully`);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Failed to delete role");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          <RolesTable
            roles={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredData.length} of {rolesData.length} records
            </p>
          </div>
        </CardContent>
      </Card>

      <AddRoleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        roleName={selectedRole?.role_name || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
