import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Cylinder,
  cylinderCheckOutService,
} from "../services/cylinderCheckOutService";
import {
  companyMasterService,
  Company,
} from "../services/companyMasterService";
import { cylinderMasterService } from "../services/cylinderMasterService";
import { contactsService, Contact } from "../services/contactsService";
import { emailService } from "../services/emailService";
import { getCurrentDateUS } from "../utils/dateUtils";
import { CylinderCheckOutForm } from "../components/cylinderCheckOut/CylinderCheckOutForm";
import { CylinderScanner } from "../components/cylinderCheckOut/CylinderScanner";
import { ScannedCylindersList } from "../components/cylinderCheckOut/ScannedCylindersList";
import { CheckOutSummary } from "../components/cylinderCheckOut/CheckOutSummary";
import { AddCompanyMasterDialog } from "../components/companyMaster/AddCompanyMasterDialog";
import { CompanyMasterFormData } from "../components/companyMaster/CompanyMasterForm";
import { AddContactDialog } from "../components/contacts/AddContactDialog";
import { ContactFormData } from "../components/contacts/ContactForm";
import { AuthUser } from "../services/authService";

interface CylinderCheckOutProps {
  currentUser: AuthUser | null;
}

export function CylinderCheckOut({ currentUser }: CylinderCheckOutProps) {
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [cylinders, setCylinders] = useState<Cylinder[]>([]);
  const [checkOutCompleted, setCheckOutCompleted] = useState(false);
  const [completedCylinders, setCompletedCylinders] = useState<string[]>([]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const [companies, setCompanies] = useState<Company[]>(
    companyMasterService.getCompanies(),
  );
  const [contacts, setContacts] = useState<Contact[]>(
    contactsService.getContacts(),
  );
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [companiesData, contactsData] = await Promise.all([
          companyMasterService.fetchCompanies(),
          contactsService.fetchContacts(),
          cylinderMasterService.fetchCylinders(),
        ]);
        if (isMounted) {
          setCompanies(companiesData);
          setContacts(contactsData);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load companies";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoadingCompanies(false);
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Company Master form data
  const [companyFormData, setCompanyFormData] = useState<CompanyMasterFormData>(
    {
      id: 0,
      company_code: "",
      company_name: "",
      phone: "",
      email: "",
      billing_reference_type: "NA",
      billing_reference_number: "",
      billing_address: "",
      active: true,
    },
  );

  // Contact form data
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    id: 0,
    company_id: 0,
    name: "",
    phone: "",
    email: "",
    active: true,
  });

  // Pre-select company when opening add contact dialog
  useEffect(() => {
    if (isAddContactOpen && selectedCompanyId) {
      setContactFormData((prev) => ({
        ...prev,
        company_id: selectedCompanyId,
      }));
    }
  }, [isAddContactOpen, selectedCompanyId]);

  const handleCustomerSelect = (code: string) => {
    const company = companies.find((c) => c.company_code === code);
    if (company) {
      setCustomerCode(code);
      setCustomerName(company.company_name);
      setSelectedContact(""); // Reset contact when customer changes
      setSelectedCompanyId(company.id);
      setSelectedContactId(null); // Reset contact ID
    }
  };

  const handleAddCompanyConfirm = async () => {
    if (
      !companyFormData.company_code ||
      !companyFormData.company_name ||
      !companyFormData.email
    ) {
      toast.error(
        "Please fill in all required fields (Company Code, Company Name, Email)",
      );
      return;
    }

    try {
      const addedCompany = await companyMasterService.addCompany({
        company_code: companyFormData.company_code.toUpperCase(),
        company_name: companyFormData.company_name,
        phone: companyFormData.phone,
        email: companyFormData.email,
        billing_reference_type: companyFormData.billing_reference_type,
        billing_reference_number: companyFormData.billing_reference_number,
        billing_address: companyFormData.billing_address,
        active: companyFormData.active,
      });
      const updatedCompanies = [...companies, addedCompany];
      setCompanies(updatedCompanies);
      companyMasterService.setCompanies(updatedCompanies);

      // Automatically select the newly created customer
      setCustomerCode(addedCompany.company_code);
      setCustomerName(addedCompany.company_name);
      setSelectedCompanyId(addedCompany.id);

      // Reset form data
      setCompanyFormData({
        id: 0,
        company_code: "",
        company_name: "",
        phone: "",
        email: "",
        billing_reference_type: "NA",
        billing_reference_number: "",
        billing_address: "",
        active: true,
      });

      setIsAddCustomerOpen(false);
      toast.success(`Company ${addedCompany.company_name} added successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create company";
      toast.error(message);
    }
  };

  const handleAddContactConfirm = async () => {
    if (
      !contactFormData.company_id ||
      !contactFormData.name ||
      !contactFormData.phone ||
      !contactFormData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const addedContact = await contactsService.addContact({
        company_id: contactFormData.company_id,
        name: contactFormData.name,
        phone: contactFormData.phone,
        email: contactFormData.email,
        active: contactFormData.active,
      });
      const updatedContacts = [...contacts, addedContact];
      setContacts(updatedContacts);
      contactsService.setContacts(updatedContacts);

      // Automatically select the newly created contact
      setSelectedContact(addedContact.id.toString());
      setSelectedContactId(addedContact.id);

      // Reset form data
      setContactFormData({
        id: 0,
        company_id: 0,
        name: "",
        phone: "",
        email: "",
        active: true,
      });

      setIsAddContactOpen(false);
      toast.success(`Contact ${addedContact.name} added successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create contact";
      toast.error(message);
    }
  };

  const getCustomerContacts = () => {
    if (!selectedCompanyId) return [];
    return contacts.filter((c) => c.company_id === selectedCompanyId);
  };

  const getContactDetails = (contactId: string) => {
    const contact = contacts.find((c) => c.id.toString() === contactId);
    return {
      name: contact?.name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
    };
  };

  const handleContactChange = (contactId: string) => {
    setSelectedContact(contactId);
    const contact = contacts.find((c) => c.id.toString() === contactId);
    if (contact) {
      setSelectedContactId(contact.id);
    } else {
      setSelectedContactId(null);
    }
  };

  const handleScanBarcode = async (barcode: string) => {
    const validation = cylinderCheckOutService.validateBarcode(barcode);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid barcode");
      return;
    }

    if (!customerCode) {
      toast.error("Please select company first");
      return;
    }

    // Use the normalized (uppercase) barcode from validation
    const normalizedBarcode =
      validation.normalizedBarcode || barcode.trim().toUpperCase();

    // Check if this serial number has already been scanned in the current session (case-insensitive)
    const alreadyScanned = cylinders.find(
      (c) => c.barcode.toUpperCase() === normalizedBarcode,
    );
    if (alreadyScanned) {
      toast.error(
        `Serial Number "${normalizedBarcode}" has already been scanned in this session`,
      );
      return;
    }

    // Use cylinder data from validation
    const cylinderData = validation.cylinderData;

    const cylinderId = cylinderData?.id;
    if (!cylinderId) {
      toast.error("Cylinder ID not found for this barcode");
      return;
    }

    try {
      const isCheckedOut =
        await cylinderCheckOutService.isCylinderCheckedOut(cylinderId);
      if (isCheckedOut) {
        toast.error(
          `Cylinder Number "${normalizedBarcode}" is already checked out`,
        );
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to validate cylinder checkout status";
      toast.error(message);
      return;
    }

    const newCylinder: Cylinder = {
      id: Date.now(),
      barcode: normalizedBarcode, // Store in uppercase
      cylinder_id: cylinderId,
    };

    setCylinders([...cylinders, newCylinder]);
  };

  const handleRemoveCylinder = (index: number) => {
    setCylinders(cylinders.filter((_, i) => i !== index));
    toast.success("Cylinder removed");
  };

  const handlePrintSampleTag = (cylinder: Cylinder) => {
    cylinderCheckOutService.printSampleTag(cylinder);
    toast.success(`Printing sample tag for ${cylinder.barcode}`);
  };

  const handleCreateOrder = async () => {
    // Validate using ID-based validation
    const validation = cylinderCheckOutService.validateCheckOutWithIds(
      selectedCompanyId,
      selectedContactId,
      cylinders,
    );
    if (!validation.valid) {
      toast.error(validation.error || "Cannot create check-out");
      return;
    }

    try {
      await cylinderCheckOutService.submitCheckOutRecords(
        selectedCompanyId!,
        selectedContactId!,
        cylinders,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create check-out";
      toast.error(message);
      return;
    }

    // Store completed cylinders list (using barcodes)
    const completedCylindersList = cylinders.map((c) => c.barcode);
    setCompletedCylinders(completedCylindersList);
    setCheckOutCompleted(true);

    // Send email notification to the contact
    const contactDetails = getContactDetails(selectedContact);
    const emailSent = emailService.sendCheckOutConfirmation({
      contactName: contactDetails.name,
      contactEmail: contactDetails.email,
      customerName: customerName,
      checkOutDate: getCurrentDateUS(),
      cylinders: completedCylindersList,
    });

    if (emailSent) {
      toast.success(
        `Check-out completed! Email sent to ${contactDetails.email}`,
      );
    } else {
      toast.warning("Check-out completed, but email notification failed");
    }

    // Clear the cylinders list but preserve customer information
    setCylinders([]);
  };

  const handleClearAll = () => {
    setCylinders([]);
    setCustomerCode("");
    setCustomerName("");
    setSelectedContact("");
    setSelectedCompanyId(null);
    setSelectedContactId(null);
    setCheckOutCompleted(false);
    setCompletedCylinders([]);
  };

  const contactDetails = getContactDetails(selectedContact);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-bold">Cylinder Check-Out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CylinderCheckOutForm
              customerCode={customerCode}
              selectedContact={selectedContact}
              customers={companies}
              contacts={getCustomerContacts()}
              isLoadingCompanies={isLoadingCompanies}
              onCustomerChange={handleCustomerSelect}
              onContactChange={handleContactChange}
              onAddCustomer={() => setIsAddCustomerOpen(true)}
              onAddContact={() => setIsAddContactOpen(true)}
            />

            <CylinderScanner
              onScan={handleScanBarcode}
              disabled={!customerCode}
            />

            <Separator />

            <ScannedCylindersList
              cylinders={cylinders}
              onRemove={handleRemoveCylinder}
              onPrint={handlePrintSampleTag}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleCreateOrder}
                className="flex-1"
                disabled={checkOutCompleted || cylinders.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Confirm Check-Out
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <CheckOutSummary
          customerName={customerName}
          contactName={contactDetails.name}
          contactEmail={contactDetails.email}
          contactPhone={contactDetails.phone}
          checkOutCompleted={checkOutCompleted}
          completedCylinders={completedCylinders}
        />
      </div>

      {/* Shared Dialogs */}
      <AddCompanyMasterDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        formData={companyFormData}
        onFormChange={setCompanyFormData}
        onConfirm={handleAddCompanyConfirm}
      />

      <AddContactDialog
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        formData={contactFormData}
        onFormChange={setContactFormData}
        onConfirm={handleAddContactConfirm}
      />
    </div>
  );
}
