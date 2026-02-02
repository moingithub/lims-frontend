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
import { Module, modulesService } from "../services/modulesService";
import { SearchBar } from "../components/shared/SearchBar";
import { ModulesTable } from "../components/modules/ModulesTable";
import { AddModuleDialog } from "../components/modules/AddModuleDialog";
import { EditModuleDialog } from "../components/modules/EditModuleDialog";
import { DeleteModuleDialog } from "../components/modules/DeleteModuleDialog";
import { ModuleFormData } from "../components/modules/ModuleForm";

export function Modules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<ModuleFormData>({
    id: 0,
    module_name: "",
    description: "",
    active: true,
    created_by: 1,
  });

  const [modulesData, setModulesData] = useState<Module[]>(
    modulesService.getModules(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadModules = async () => {
      try {
        const modules = await modulesService.fetchModules();
        if (isMounted) setModulesData(modules);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load modules";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = modulesService.searchModules(modulesData, searchTerm);

  const handleAdd = () => {
    setFormData({
      id: 0,
      module_name: "",
      description: "",
      active: true,
      created_by: 1,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (module: Module, index: number) => {
    setSelectedModule(module);
    setSelectedIndex(index);
    setFormData({
      id: module.id,
      module_name: module.module_name,
      description: module.description,
      active: module.active,
      created_by: module.created_by,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (module: Module, index: number) => {
    setSelectedModule(module);
    setSelectedIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = modulesService.validateModule(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const createdModule = await modulesService.addModule({
        module_name: formData.module_name,
        description: formData.description,
        active: formData.active,
      });
      const updatedModules = [...modulesData, createdModule];
      setModulesData(updatedModules);
      modulesService.setModules(updatedModules);
      toast.success(`Module "${createdModule.module_name}" added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create module";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    const validation = modulesService.validateModule(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    if (!selectedModule) return;

    try {
      const savedModule = await modulesService.updateModule(selectedModule.id, {
        id: selectedModule.id,
        module_name: formData.module_name,
        description: formData.description,
        active: formData.active,
      });
      const updatedModules = modulesData.map((item) =>
        item.id === selectedModule.id ? savedModule : item,
      );
      setModulesData(updatedModules);
      modulesService.setModules(updatedModules);
      toast.success(`Module "${savedModule.module_name}" updated successfully`);
      setIsEditDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update module";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!selectedModule) return;

    try {
      await modulesService.deleteModule(selectedModule.id);
      const updatedModules = modulesData.filter(
        (item) => item.id !== selectedModule.id,
      );
      setModulesData(updatedModules);
      modulesService.setModules(updatedModules);
      toast.success(
        `Module "${selectedModule.module_name}" deleted successfully`,
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete module";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search modules..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>

          <ModulesTable
            modules={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <AddModuleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditModuleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteModuleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        moduleName={selectedModule?.module_name || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
