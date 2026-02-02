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
import {
  Cylinder,
  cylinderMasterService,
} from "../services/cylinderMasterService";
import { SearchBar } from "../components/shared/SearchBar";
import { CylinderMasterTable } from "../components/cylinderMaster/CylinderMasterTable";
import { AddCylinderMasterDialog } from "../components/cylinderMaster/AddCylinderMasterDialog";
import { EditCylinderMasterDialog } from "../components/cylinderMaster/EditCylinderMasterDialog";
import { DeleteCylinderMasterDialog } from "../components/cylinderMaster/DeleteCylinderMasterDialog";
import { CylinderMasterFormData } from "../components/cylinderMaster/CylinderMasterForm";
import { User } from "../services/authService";

interface CylinderMasterProps {
  currentUser: User | null;
}

export function CylinderMaster({ currentUser }: CylinderMasterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(
    null,
  );

  const [formData, setFormData] = useState<CylinderMasterFormData>({
    id: 0,
    cylinder_number: "",
    cylinder_type: "",
    track_inventory: "",
    location: "",
    active: true,
  });

  const [cylinderData, setCylinderData] = useState<Cylinder[]>(
    cylinderMasterService.getCylinders(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCylinders = async () => {
      try {
        const cylinders = await cylinderMasterService.fetchCylinders();
        if (isMounted) setCylinderData(cylinders);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load cylinders";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCylinders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = cylinderMasterService.searchCylinders(
    cylinderData,
    searchTerm,
  );

  const handleAdd = () => {
    setFormData({
      id: 0,
      cylinder_number: "",
      cylinder_type: "",
      track_inventory: "",
      location: "",
      active: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (cylinder: Cylinder) => {
    setSelectedCylinder(cylinder);
    setFormData({
      id: cylinder.id,
      cylinder_number: cylinder.cylinder_number,
      cylinder_type: cylinder.cylinder_type,
      track_inventory: cylinder.track_inventory,
      location: cylinder.location,
      active: cylinder.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (cylinder: Cylinder) => {
    setSelectedCylinder(cylinder);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = cylinderMasterService.validateCylinder(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const created = await cylinderMasterService.addCylinder({
        cylinder_number: formData.cylinder_number,
        cylinder_type: formData.cylinder_type,
        track_inventory: formData.track_inventory,
        location: formData.location,
        active: formData.active,
      });
      const updatedCylinders = [...cylinderData, created];
      setCylinderData(updatedCylinders);
      cylinderMasterService.setCylinders(updatedCylinders);
      toast.success(`Cylinder "${created.cylinder_number}" added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create cylinder";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    if (!selectedCylinder) return;

    const validation = cylinderMasterService.validateCylinder(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    try {
      const updated = await cylinderMasterService.updateCylinder(
        selectedCylinder.id,
        {
          id: selectedCylinder.id,
          cylinder_number: formData.cylinder_number,
          cylinder_type: formData.cylinder_type,
          track_inventory: formData.track_inventory,
          location: formData.location,
          active: formData.active,
        },
      );
      const updatedCylinders = cylinderData.map((item) =>
        item.id === selectedCylinder.id ? updated : item,
      );
      setCylinderData(updatedCylinders);
      cylinderMasterService.setCylinders(updatedCylinders);
      toast.success(
        `Cylinder "${updated.cylinder_number}" updated successfully`,
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update cylinder";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCylinder) return;
    try {
      await cylinderMasterService.deleteCylinder(selectedCylinder.id);
      const updatedCylinders = cylinderData.filter(
        (item) => item.id !== selectedCylinder.id,
      );
      setCylinderData(updatedCylinders);
      cylinderMasterService.setCylinders(updatedCylinders);
      toast.success(
        `Cylinder "${selectedCylinder.cylinder_number}" deleted successfully`,
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete cylinder";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Cylinder Master</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search cylinders..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cylinder
            </Button>
          </div>

          <CylinderMasterTable
            cylinders={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {cylinderData.length} cylinders
          </div>
        </CardContent>
      </Card>

      <AddCylinderMasterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditCylinderMasterDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteCylinderMasterDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        serialNumber={selectedCylinder?.cylinder_number || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
