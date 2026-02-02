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
  CompanyArea,
  companyAreaService,
} from "../services/companyAreaService";
import { CompanyAreaTable } from "../components/companyArea/CompanyAreaTable";
import { CompanyAreaDialog } from "../components/companyArea/CompanyAreaDialog";
import { DeleteCompanyAreaDialog } from "../components/companyArea/DeleteCompanyAreaDialog";
import { CompanyAreaFormData } from "../components/companyArea/CompanyAreaForm";

export function CompanyArea() {
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>(
    companyAreaService.getCompanyAreas(),
  );
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;

    const loadAreas = async () => {
      try {
        const data = await companyAreaService.fetchCompanyAreas();
        if (isMounted) setCompanyAreas(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load company areas";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAreas();

    return () => {
      isMounted = false;
    };
  }, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CompanyArea | null>(null);
  const [deletingArea, setDeletingArea] = useState<CompanyArea | null>(null);
  const [formData, setFormData] = useState<CompanyAreaFormData>({
    id: 0,
    company_id: 0,
    area: "",
    region: "",
    description: "",
    active: true,
  });

  const handleAdd = () => {
    setEditingArea(null);
    setFormData({
      id: 0,
      company_id: 0,
      area: "",
      region: "",
      description: "",
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (companyArea: CompanyArea) => {
    setEditingArea(companyArea);
    setFormData({
      id: companyArea.id,
      company_id: companyArea.company_id,
      area: companyArea.area,
      region: companyArea.region,
      description: companyArea.description,
      active: companyArea.active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = companyAreaService.validateCompanyArea(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all required fields");
      return;
    }

    if (editingArea) {
      try {
        const updatedArea = await companyAreaService.updateCompanyArea(
          editingArea.id,
          {
            id: editingArea.id,
            company_id: formData.company_id,
            area: formData.area,
            region: formData.region,
            description: formData.description,
            active: formData.active,
          },
        );
        const updatedAreas = companyAreas.map((ca) =>
          ca.id === editingArea.id ? updatedArea : ca,
        );
        setCompanyAreas(updatedAreas);
        companyAreaService.setCompanyAreas(updatedAreas);
        toast.success("Company area updated successfully");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update company area";
        toast.error(message);
        return;
      }
    } else {
      try {
        const newCompanyArea = await companyAreaService.addCompanyArea({
          company_id: formData.company_id,
          area: formData.area,
          region: formData.region,
          description: formData.description,
          active: formData.active,
        });
        const updatedAreas = [...companyAreas, newCompanyArea];
        setCompanyAreas(updatedAreas);
        companyAreaService.setCompanyAreas(updatedAreas);
        toast.success("Company area added successfully");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create company area";
        toast.error(message);
        return;
      }
    }

    setIsDialogOpen(false);
    setEditingArea(null);
  };

  const handleDelete = (companyArea: CompanyArea) => {
    setDeletingArea(companyArea);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingArea) {
      try {
        await companyAreaService.deleteCompanyArea(deletingArea.id);
        const updatedAreas = companyAreas.filter(
          (ca) => ca.id !== deletingArea.id,
        );
        setCompanyAreas(updatedAreas);
        companyAreaService.setCompanyAreas(updatedAreas);
        toast.success("Company area deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingArea(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete company area";
        toast.error(message);
      }
    }
  };

  const handleToggleStatus = (id: number) => {
    setCompanyAreas(
      companyAreas.map((ca) =>
        ca.id === id ? { ...ca, active: !ca.active } : ca,
      ),
    );
    const area = companyAreas.find((ca) => ca.id === id);
    if (area) {
      toast.success(
        `Area ${area.area} ${!area.active ? "activated" : "deactivated"}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">Company Areas</CardTitle>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CompanyAreaTable
            companyAreas={isLoading ? [] : companyAreas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {companyAreas.length} company areas</p>
          </div>
        </CardContent>
      </Card>

      <CompanyAreaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={handleSave}
        isEditing={!!editingArea}
      />

      <DeleteCompanyAreaDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        companyArea={deletingArea}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
