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
  Company,
  companyMasterService,
} from "../services/companyMasterService";
import { SearchBar } from "../components/shared/SearchBar";
import { CompanyMasterTable } from "../components/companyMaster/CompanyMasterTable";
import { AddCompanyMasterDialog } from "../components/companyMaster/AddCompanyMasterDialog";
import { EditCompanyMasterDialog } from "../components/companyMaster/EditCompanyMasterDialog";
import { DeleteCompanyMasterDialog } from "../components/companyMaster/DeleteCompanyMasterDialog";
import { CompanyMasterFormData } from "../components/companyMaster/CompanyMasterForm";

export function CompanyMaster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<CompanyMasterFormData>({
    id: 0,
    company_code: "",
    company_name: "",
    phone: "",
    email: "",
    billing_reference_type: "GL Code",
    billing_reference_number: "",
    billing_address: "",
    active: true,
  });

  const [companies, setCompanies] = useState<Company[]>(
    companyMasterService.getCompanies(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      try {
        const data = await companyMasterService.fetchCompanies();
        if (isMounted) setCompanies(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load companies";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCompanies = companyMasterService.searchCompanies(
    companies,
    searchTerm,
  );

  const handleAdd = () => {
    setFormData({
      id: 0,
      company_code: "",
      company_name: "",
      phone: "",
      email: "",
      billing_reference_type: "GL Code",
      billing_reference_number: "",
      billing_address: "",
      active: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      id: company.id,
      company_code: company.company_code,
      company_name: company.company_name,
      phone: company.phone,
      email: company.email,
      billing_reference_type: company.billing_reference_type,
      billing_reference_number: company.billing_reference_number,
      billing_address: company.billing_address,
      active: company.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setDeletingCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = companyMasterService.validateCompany(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const createdCompany = await companyMasterService.addCompany({
        company_code: formData.company_code,
        company_name: formData.company_name,
        phone: formData.phone,
        email: formData.email,
        billing_reference_type: formData.billing_reference_type,
        billing_reference_number: formData.billing_reference_number,
        billing_address: formData.billing_address,
        active: formData.active,
      });
      const updatedCompanies = [...companies, createdCompany];
      setCompanies(updatedCompanies);
      companyMasterService.setCompanies(updatedCompanies);
      toast.success("Company added successfully");
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create company";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    if (!editingCompany) return;

    const validation = companyMasterService.validateCompany(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    try {
      const savedCompany = await companyMasterService.updateCompany(
        editingCompany.id,
        {
          id: editingCompany.id,
          company_code: formData.company_code,
          company_name: formData.company_name,
          phone: formData.phone,
          email: formData.email,
          billing_reference_type: formData.billing_reference_type,
          billing_reference_number: formData.billing_reference_number,
          billing_address: formData.billing_address,
          active: formData.active,
        },
      );
      const updatedCompanies = companies.map((company) =>
        company.id === editingCompany.id ? savedCompany : company,
      );
      setCompanies(updatedCompanies);
      companyMasterService.setCompanies(updatedCompanies);
      toast.success("Company updated successfully");
      setIsEditDialogOpen(false);
      setEditingCompany(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update company";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCompany) return;
    try {
      await companyMasterService.deleteCompany(deletingCompany.id);
      const updatedCompanies = companies.filter(
        (company) => company.id !== deletingCompany.id,
      );
      setCompanies(updatedCompanies);
      companyMasterService.setCompanies(updatedCompanies);
      toast.success("Company deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingCompany(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete company";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">Company Master</CardTitle>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search companies..."
            />
          </div>

          <CompanyMasterTable
            companies={isLoading ? [] : filteredCompanies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredCompanies.length} of {companies.length} companies
            </p>
          </div>
        </CardContent>
      </Card>

      <AddCompanyMasterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditCompanyMasterDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteCompanyMasterDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        companyName={deletingCompany?.company_name || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
