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
import { User, usersService } from "../services/usersService";
import { SearchBar } from "../components/shared/SearchBar";
import { UsersTable } from "../components/users/UsersTable";
import { AddUserDialog } from "../components/users/AddUserDialog";
import { EditUserDialog } from "../components/users/EditUserDialog";
import { DeleteUserDialog } from "../components/users/DeleteUserDialog";
import { ResetPasswordDialog } from "../components/users/ResetPasswordDialog";
import { UserFormData } from "../components/users/UserForm";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    id: 0,
    name: "",
    email: "",
    password: "",
    role_id: 0,
    active: true,
    created_by: 1,
  });

  const [usersData, setUsersData] = useState<User[]>(usersService.getUsers());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const users = await usersService.fetchUsers();
        if (isMounted) setUsersData(users);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load users";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = usersService.searchUsers(usersData, searchTerm);

  const handleAdd = () => {
    setFormData({
      id: 0,
      name: "",
      email: "",
      password: "",
      role_id: 0,
      active: true,
      created_by: 1,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id,
      active: user.active,
      created_by: user.created_by,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = usersService.validateUser(formData, {
      requirePassword: false,
    });
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const createdUser = await usersService.addUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id,
        active: formData.active,
      });
      const updatedUsers = [...usersData, createdUser];
      setUsersData(updatedUsers);
      usersService.setUsers(updatedUsers);
      toast.success(`User "${createdUser.name}" added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    if (!selectedUser) return;

    const validation = usersService.validateUser(formData, {
      requirePassword: false,
    });
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const savedUser = await usersService.updateUser(selectedUser.id, {
        id: selectedUser.id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id,
        active: formData.active,
      });
      const updatedUsers = usersData.map((u) =>
        u.id === selectedUser.id ? savedUser : u,
      );
      setUsersData(updatedUsers);
      usersService.setUsers(updatedUsers);
      toast.success(`User "${savedUser.name}" updated successfully`);
      setIsEditDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update user";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await usersService.deleteUser(selectedUser.id);
      const updatedUsers = usersData.filter((u) => u.id !== selectedUser.id);
      setUsersData(updatedUsers);
      usersService.setUsers(updatedUsers);
      toast.success(`User "${selectedUser.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    }
  };

  const confirmResetPassword = async (newPassword: string) => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.trim() === "") {
      toast.error("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsResetting(true);
      const message = await usersService.resetUserPassword(
        selectedUser.id,
        newPassword,
      );
      toast.success(message);
      setIsResetDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search users..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <UsersTable
            users={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
          />
        </CardContent>
      </Card>

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        userName={selectedUser?.name || ""}
        onConfirm={confirmDelete}
      />

      <ResetPasswordDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        user={selectedUser}
        onConfirm={confirmResetPassword}
        isLoading={isResetting}
      />
    </div>
  );
}
