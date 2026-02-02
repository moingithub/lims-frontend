import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { ScanText, Plus, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { getCurrentDateUS } from "../utils/dateUtils";
import {
  CheckedInSample,
  sampleCheckInService,
} from "../services/sampleCheckInService";
import { analysisPricingService } from "../services/analysisPricingService";
import {
  companyMasterService,
  Company,
} from "../services/companyMasterService";
import { contactsService, Contact } from "../services/contactsService";
import {
  companyAreaService,
  CompanyArea,
} from "../services/companyAreaService";
import { cylinderMasterService } from "../services/cylinderMasterService";
import { cylinderCheckOutService } from "../services/cylinderCheckOutService";
import { workOrdersService } from "../services/workOrdersService";
import { CompanyMasterFormData } from "../components/companyMaster/CompanyMasterForm";
import { CompanyContactSelector } from "../components/sampleCheckIn/CompanyContactSelector";
import { AnalysisOptionsForm } from "../components/sampleCheckIn/AnalysisOptionsForm";
import { SampleDetailsForm } from "../components/sampleCheckIn/SampleDetailsForm";
import { CheckedInCylindersTable } from "../components/sampleCheckIn/CheckedInCylindersTable";
import { WorkOrderSummary } from "../components/sampleCheckIn/WorkOrderSummary";
import { TagImageDialog } from "../components/sampleCheckIn/TagImageDialog";
import { AddCompanyMasterDialog } from "../components/companyMaster/AddCompanyMasterDialog";
import { AddContactDialog } from "../components/contacts/AddContactDialog";
import { WorkOrderReportDialog } from "../components/sampleCheckIn/WorkOrderReportDialog";
import { ContactFormData } from "../components/contacts/ContactForm";

// Use the CheckedInSample interface from the service instead of duplicating
type CheckedInCylinder = CheckedInSample;

export function SampleCheckIn({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  // Customer and Contact state
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );

  // Current customer context (persists across form clears)
  const [currentCustomer, setCurrentCustomer] = useState("Acme Corporation");

  // Mock data: Monthly cylinder count for current customer
  const [monthlyCustomerCylinders] = useState(45);

  // Analysis number counter
  const [analysisCounter, setAnalysisCounter] = useState(1);

  // Dialog states
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

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
    if (isAddContactDialogOpen && selectedCompanyId) {
      setContactFormData((prev) => ({
        ...prev,
        company_id: selectedCompanyId,
      }));
    }
  }, [isAddContactDialogOpen, selectedCompanyId]);

  // Get first active analysis type as default
  const getDefaultAnalysisType = () => {
    const activeTypes = analysisPricingService.getActiveAnalysisPrices();
    return activeTypes.length > 0 ? activeTypes[0].analysis_code : "";
  };

  // Form fields for scanned data
  const [analysisType, setAnalysisType] = useState(getDefaultAnalysisType());
  const [checkInType, setCheckInType] = useState<"Cylinder" | "Sample">(
    "Cylinder",
  );
  const [customerCylinder, setCustomerCylinder] = useState(false);
  const [rushed, setRushed] = useState(false);
  const [invoiceRefName, setInvoiceRefName] = useState("NA");
  const [invoiceRefValue, setInvoiceRefValue] = useState("");
  const [date, setDate] = useState("");
  const [producer, setProducer] = useState("");
  const [company, setCompany] = useState("");
  const [area, setArea] = useState("NA");
  const [wellName, setWellName] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [sampleType, setSampleType] = useState("spot");
  const [flowRate, setFlowRate] = useState("");
  const [pressure, setPressure] = useState("");
  const [pressureUnit, setPressureUnit] = useState("PSIG");
  const [temperature, setTemperature] = useState("");
  const [fieldH2S, setFieldH2S] = useState("");
  const [costCode, setCostCode] = useState("");
  const [cylinderNumber, setCylinderNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [scannedTagImage, setScannedTagImage] = useState("");
  const [sampledByNatty, setSampledByNatty] = useState(false);

  // Checked-in cylinders and work order
  const [checkedInCylinders, setCheckedInCylinders] = useState<
    CheckedInCylinder[]
  >([]);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [lastWorkOrderCylinders, setLastWorkOrderCylinders] = useState<
    CheckedInCylinder[]
  >([]);
  const [selectedTagImage, setSelectedTagImage] = useState<string | null>(null);

  // Data - Load from Company Master and Contacts services
  const [companies, setCompanies] = useState<Company[]>(
    companyMasterService.getActiveCompanies(),
  );
  const [contacts, setContacts] = useState<Contact[]>(
    contactsService.getActiveContacts(),
  );
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>(
    companyAreaService.getActiveCompanyAreas(),
  );

  // Load dropdown data on first render
  useEffect(() => {
    let isMounted = true;

    const loadDropdownData = async () => {
      try {
        const [companiesData, contactsData, areasData, _cylinders] =
          await Promise.all([
            companyMasterService.fetchCompanies(),
            contactsService.fetchContacts(),
            companyAreaService.fetchCompanyAreas(),
            cylinderMasterService.fetchCylinders(),
          ]);
        void _cylinders;

        await analysisPricingService.fetchAnalysisPrices();

        let nextSequence = analysisCounter;
        try {
          nextSequence = await sampleCheckInService.getNextAnalysisSequence();
        } catch (sequenceError) {
          void sequenceError;
        }

        if (!isMounted) return;

        const activeCompanies = companiesData.filter(
          (company) => company.active,
        );
        const activeContacts = contactsData.filter((contact) => contact.active);
        const activeAreas = areasData.filter((area) => area.active);

        setCompanies(activeCompanies);
        setContacts(activeContacts);
        setCompanyAreas(activeAreas);

        const activeAnalysisTypes =
          analysisPricingService.getActiveAnalysisPrices();
        if (activeAnalysisTypes.length > 0) {
          const firstAnalysisType = activeAnalysisTypes[0].analysis_code;
          if (
            !analysisType ||
            !activeAnalysisTypes.some((a) => a.analysis_code === analysisType)
          ) {
            setAnalysisType(firstAnalysisType);
          }
        }

        setAnalysisCounter(nextSequence);
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };

    loadDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  const ensureNextAnalysisSequence = async (): Promise<number> => {
    try {
      const nextSequence = await sampleCheckInService.getNextAnalysisSequence();
      const resolved = Math.max(analysisCounter, nextSequence);
      if (resolved !== analysisCounter) {
        setAnalysisCounter(resolved);
      }
      return resolved;
    } catch (error) {
      return analysisCounter;
    }
  };

  const handleCustomerSelect = (code: string) => {
    const company = companies.find((c) => c.company_code === code);
    if (company) {
      setCustomerCode(code);
      setCustomerName(company.company_name);
      setSelectedContact(""); // Reset contact when customer changes
      setSelectedCompanyId(company.id);
    }
  };

  const getCustomerContacts = () => {
    if (!selectedCompanyId) return [];
    return contactsService.getActiveContactsByCompanyId(selectedCompanyId);
  };

  const handleContactSelect = (contactIdString: string) => {
    setSelectedContact(contactIdString);
    setSelectedContactId(parseInt(contactIdString));
  };

  const handleAddCompanyConfirm = () => {
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

    const newCompany: Company = {
      id: 0,
      company_code: companyFormData.company_code.toUpperCase(),
      company_name: companyFormData.company_name,
      phone: companyFormData.phone,
      email: companyFormData.email,
      billing_reference_type: companyFormData.billing_reference_type,
      billing_reference_number: companyFormData.billing_reference_number,
      billing_address: companyFormData.billing_address,
      active: companyFormData.active,
      created_by: 1, // TODO: Replace with actual logged-in user ID
    };

    const createCompany = async () => {
      try {
        const addedCompany = await companyMasterService.addCompany(newCompany);
        setCompanies([...companies, addedCompany]);
        setCustomerCode(companyFormData.company_code.toUpperCase());
        setCustomerName(companyFormData.company_name);
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

        setIsAddCompanyDialogOpen(false);
        toast.success(
          `Company ${companyFormData.company_name} added successfully`,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add company";
        toast.error(message);
      }
    };

    void createCompany();

    return;
  };

  const handleAddContactConfirm = () => {
    if (
      !contactFormData.company_id ||
      !contactFormData.name ||
      !contactFormData.phone ||
      !contactFormData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newContact: Contact = {
      id: 0,
      company_id: contactFormData.company_id,
      name: contactFormData.name,
      phone: contactFormData.phone,
      email: contactFormData.email,
      active: contactFormData.active,
      created_by: 1, // TODO: Replace with actual logged-in user ID
    };

    const createContact = async () => {
      try {
        const addedContact = await contactsService.addContact(newContact);

        // Refresh contacts list from service to ensure dropdown updates
        setContacts(contactsService.getActiveContacts());

        // Auto-select the newly added contact
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

        setIsAddContactDialogOpen(false);
        toast.success(`Contact ${contactFormData.name} added successfully`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add contact";
        toast.error(message);
      }
    };

    void createContact();
  };

  const handleOCRScan = async () => {
    if (!customerCode) {
      toast.error("Please select a company before scanning");
      return;
    }

    if (!selectedContactId) {
      toast.error("Please select a contact before scanning");
      return;
    }

    // Simulate OCR scanning of sample tag
    const mockTagNumber = `TAG-${Math.floor(Math.random() * 10000)}`;
    const mockTagImage = sampleCheckInService.generateMockSampleTag(
      mockTagNumber,
      getCurrentDateUS(),
    );
    setScannedTagImage(mockTagImage);

    await ensureNextAnalysisSequence();
    setDate(getCurrentDateUS());
    setProducer("ABC Energy");
    setCompany("Acme Corporation");
    setCurrentCustomer("Acme Corporation");
    setWellName("Well-123");
    setMeterNumber("MTR-456");
    setSampleType("spot");
    setFlowRate("1500");
    setPressure("250");
    setTemperature("75");
    setFieldH2S("10");
    setCylinderNumber(mockTagNumber);
    setRemarks("Sample collected from field");
  };

  const handleAddCylinder = async () => {
    if (!cylinderNumber) {
      toast.error("Please enter or scan a cylinder number first");
      return;
    }

    if (!customerCode) {
      toast.error("Please select a company first");
      return;
    }

    // Normalize cylinder number to uppercase
    const normalizedCylinderNumber = cylinderNumber.trim().toUpperCase();

    // Check for duplicate cylinder number in the check-in list (case-insensitive)
    const isDuplicate = checkedInCylinders.some(
      (cylinder) =>
        cylinder.cylinder_number.toUpperCase() === normalizedCylinderNumber,
    );

    if (isDuplicate) {
      toast.error(
        `Cylinder Number "${normalizedCylinderNumber}" has already been added to the check-in list. Please use a different cylinder.`,
        { duration: 5000 },
      );
      return;
    }

    // Validate cylinder number against Cylinder Master if NOT customer-owned
    const matchedCylinder = cylinderMasterService.getCylinderByCylinderNumber(
      normalizedCylinderNumber,
    );

    if (!customerCylinder) {
      const cylinder = matchedCylinder;

      if (!cylinder) {
        toast.error(
          `Cylinder Number "${normalizedCylinderNumber}" not found in Cylinder Master. Please add it first or check "This is a customer-owned cylinder" if applicable.`,
          { duration: 5000 },
        );
        return;
      }

      if (!cylinder.active) {
        toast.error(
          `Cylinder Number "${normalizedCylinderNumber}" is inactive in Cylinder Master.`,
          { duration: 5000 },
        );
        return;
      }

      if (cylinder.id) {
        try {
          const checkoutRecord =
            await cylinderCheckOutService.getActiveCheckOutRecord(cylinder.id);
          if (!checkoutRecord) {
            toast.error(
              "Invalid Check-In: The cylinder is currently not in “Checked-Out” status. Please check out the cylinder before attempting to check it in.",
              { duration: 5000 },
            );
            return;
          }

          if (
            selectedCompanyId &&
            checkoutRecord.company_id !== selectedCompanyId
          ) {
            const expectedCompany = companies.find(
              (company) => company.id === checkoutRecord.company_id,
            )?.company_name;
            const selectedCompany = companies.find(
              (company) => company.id === selectedCompanyId,
            )?.company_name;
            toast.error(
              `Invalid Check-In: Cylinder is checked out to ${expectedCompany ?? "another company"}. Please select ${expectedCompany ?? "the correct company"} before checking it in.`,
              { duration: 5000 },
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
      }
    }

    // Generate unique analysis number
    const generatedAnalysisNumber =
      sampleCheckInService.generateAnalysisNumber(analysisCounter);

    const analysisTypeId =
      analysisPricingService.getAnalysisPriceByCode(analysisType)?.id;
    const areaId = companyAreaService.getAreaByName(area)?.id;
    const normalizedSampleType = sampleType === "spot" ? "Spot" : "Composite";

    // Prepare cylinder data (without id, created_by - service will add them)
    const cylinderData: Partial<CheckedInCylinder> = {
      company_id: selectedCompanyId ?? 0,
      company_contact_id: selectedContactId ?? undefined,
      analysis_type_id: analysisTypeId,
      area_id: areaId,
      customer_cylinder: customerCylinder,
      sampled_by_lab: sampledByNatty,
      cylinder_id: matchedCylinder?.id ?? null,
      analysis_number: generatedAnalysisNumber,
      analysis_type: analysisType,
      area,
      customer_owned_cylinder: customerCylinder,
      cylinder_number: normalizedCylinderNumber,
      date: date || getCurrentDateUS(),
      producer,
      sampled_by_natty: sampledByNatty,
      well_name: wellName,
      meter_number: meterNumber,
      sample_type: normalizedSampleType,
      flow_rate: flowRate,
      pressure,
      pressure_unit: pressureUnit,
      temperature,
      field_h2s: fieldH2S,
      cost_code: costCode,
      remarks,
      check_in_type: checkInType,
      checkin_type: checkInType,
      check_in_time: new Date().toLocaleString("en-US"),
      rushed: rushed,
      tag_image: scannedTagImage,
      scanned_tag_image: scannedTagImage || null,
      billing_reference_type: companyFormData.billing_reference_type,
      billing_reference_number: companyFormData.billing_reference_number,
      invoice_ref_name: invoiceRefName,
      invoice_ref_value: invoiceRefValue,
      work_order_number: workOrderNumber || invoiceRefValue || "",
      status: "Pending",
    };

    // ✅ SAVE cylinder individually to sampleCheckInService
    const savedCylinder = sampleCheckInService.saveCheckIn(
      selectedCompanyId!,
      selectedContactId!,
      cylinderData,
      1, // TODO: Replace with actual logged-in user ID
    );

    // Add to component state for display in the table
    setCheckedInCylinders([...checkedInCylinders, savedCylinder]);

    // Increment the analysis counter for next cylinder
    setAnalysisCounter(analysisCounter + 1);

    // Clear all fields except customer/contact
    clearForm();
  };

  const clearForm = () => {
    setAnalysisType(getDefaultAnalysisType());
    setCustomerCylinder(false);
    setRushed(false);
    setInvoiceRefName("NA");
    setInvoiceRefValue("");
    setDate("");
    setProducer("");
    setCompany("");
    setArea("NA");
    setWellName("");
    setMeterNumber("");
    setSampleType("spot");
    setFlowRate("");
    setPressure("");
    setTemperature("");
    setFieldH2S("");
    setCostCode("");
    setCylinderNumber("");
    setRemarks("");
    setScannedTagImage("");
  };

  const handleViewTagImage = (imageUrl: string) => {
    setSelectedTagImage(imageUrl);
    setIsImageDialogOpen(true);
  };

  const handleRemoveCylinder = (index: number) => {
    const cylinderToRemove = checkedInCylinders[index];

    // Remove from service storage
    if (cylinderToRemove?.id) {
      sampleCheckInService.deleteCheckedInSample(cylinderToRemove.id);
    }

    // Remove from component state
    setCheckedInCylinders(checkedInCylinders.filter((_, i) => i !== index));
    toast.success("Cylinder removed from list");
  };

  const handleGenerateWorkOrder = async () => {
    if (checkedInCylinders.length === 0) {
      toast.error("No cylinders to generate sales order for");
      return;
    }

    if (!selectedCompanyId || !selectedContactId) {
      toast.error("Please select both company and contact");
      return;
    }

    // Create work order with header and lines
    try {
      let sequence = analysisCounter;
      const samplesForWorkOrder = checkedInCylinders.map((sample) => {
        if (sample.analysis_number?.trim()) {
          return sample;
        }
        const generated = sampleCheckInService.generateAnalysisNumber(sequence);
        sequence += 1;
        return {
          ...sample,
          analysis_number: generated,
        };
      });

      if (sequence !== analysisCounter) {
        setAnalysisCounter(sequence);
        setCheckedInCylinders(samplesForWorkOrder);
      }

      const { header, lines } = workOrdersService.createWorkOrder(
        selectedCompanyId,
        selectedContactId,
        samplesForWorkOrder,
        1, // TODO: Replace with actual logged-in user ID
      );

      console.log("Work Order Created Successfully:", {
        workOrderNumber: header.work_order_number,
        companyId: header.company_id,
        contactId: header.contact_id,
        totalLines: lines.length,
        header,
        lines,
      });

      const payloads = samplesForWorkOrder.map((sample) => {
        const payload = sampleCheckInService.serializeCheckInForPost(sample);
        return {
          ...payload,
          invoice_ref_name: "WO",
          invoice_ref_value: header.work_order_number,
          work_order_number: header.work_order_number,
          status: "Pending",
        };
      });

      await sampleCheckInService.postSampleCheckIns(payloads);

      const cylinderIdsToReturn = samplesForWorkOrder
        .filter(
          (sample) =>
            !(
              sample.customer_cylinder ??
              sample.customer_owned_cylinder ??
              false
            ) && typeof sample.cylinder_id === "number",
        )
        .map((sample) => sample.cylinder_id as number);

      if (cylinderIdsToReturn.length > 0) {
        try {
          await cylinderCheckOutService.markCylindersReturned(
            cylinderIdsToReturn,
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update cylinder checkout status";
          toast.error(message);
        }
      }

      // Set the work order number for display
      setWorkOrderNumber(header.work_order_number);
      setLastWorkOrderCylinders(samplesForWorkOrder);
      toast.success("Work order generated and sample check-ins submitted");
      setCheckedInCylinders([]);
      clearForm();
    } catch (error) {
      toast.error("Failed to generate work order or submit check-ins");
    }
  };

  const handleClearAll = () => {
    setCheckedInCylinders([]);
    setWorkOrderNumber("");
    clearForm();
  };

  // Calculate total including current check-in
  const totalMonthlyCount =
    monthlyCustomerCylinders + checkedInCylinders.length;

  // Note: Pricing is now calculated when creating Work Orders, not at check-in
  // Volume discounts (5% at 50+ analyses) and rushed pricing (1.5x) are handled by analysisPricingService
  const discountPercentage = 0; // Display only, actual pricing happens in Work Orders
  const subtotal = 0;
  const discountAmount = 0;
  const totalAmount = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-bold">Sample Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <CompanyContactSelector
                customerCode={customerCode}
                selectedContact={selectedContact}
                customers={companies}
                contacts={getCustomerContacts()}
                onCustomerChange={handleCustomerSelect}
                onContactChange={handleContactSelect}
                onAddCompany={() => setIsAddCompanyDialogOpen(true)}
                onAddContact={() => setIsAddContactDialogOpen(true)}
              />

              <AnalysisOptionsForm
                analysisType={analysisType}
                area={area}
                customerCylinder={customerCylinder}
                rushed={rushed}
                sampledByNatty={sampledByNatty}
                companyAreas={companyAreas}
                customerName={customerName}
                selectedCompanyId={selectedCompanyId}
                onAnalysisTypeChange={setAnalysisType}
                onAreaChange={setArea}
                onCustomerCylinderChange={setCustomerCylinder}
                onRushedChange={setRushed}
                onSampledByNattyChange={setSampledByNatty}
              />

              <Separator />

              <Button onClick={handleOCRScan} className="w-full">
                <ScanText className="w-4 h-4 mr-2" />
                OCR Scan
              </Button>

              <Separator />
            </div>

            {/* Sample Tag Details Form - Always visible */}
            <SampleDetailsForm
              cylinderNumber={cylinderNumber}
              producer={producer}
              wellName={wellName}
              meterNumber={meterNumber}
              sampleType={sampleType}
              flowRate={flowRate}
              pressure={pressure}
              pressureUnit={pressureUnit}
              temperature={temperature}
              fieldH2S={fieldH2S}
              costCode={costCode}
              checkInType={checkInType}
              billingReferenceType={invoiceRefName}
              billingReferenceNumber={invoiceRefValue}
              remarks={remarks}
              onCylinderNumberChange={setCylinderNumber}
              onProducerChange={setProducer}
              onWellNameChange={setWellName}
              onMeterNumberChange={setMeterNumber}
              onSampleTypeChange={setSampleType}
              onFlowRateChange={setFlowRate}
              onPressureChange={setPressure}
              onPressureUnitChange={setPressureUnit}
              onTemperatureChange={setTemperature}
              onFieldH2SChange={setFieldH2S}
              onCostCodeChange={setCostCode}
              onCheckInTypeChange={setCheckInType}
              onBillingReferenceTypeChange={setInvoiceRefName}
              onBillingReferenceNumberChange={setInvoiceRefValue}
              onRemarksChange={setRemarks}
            />

            <div className="flex gap-2">
              <Button onClick={handleAddCylinder}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Check-In List
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear Form
              </Button>
            </div>

            <Separator />

            <CheckedInCylindersTable
              cylinders={checkedInCylinders}
              onRemove={handleRemoveCylinder}
              onViewImage={handleViewTagImage}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateWorkOrder}
                disabled={!!workOrderNumber || checkedInCylinders.length === 0}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Generate Work Order
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <WorkOrderSummary
          workOrderNumber={workOrderNumber}
          currentCustomer={currentCustomer}
          totalMonthlyCount={totalMonthlyCount}
          monthlyCustomerCylinders={monthlyCustomerCylinders}
          currentCylindersCount={checkedInCylinders.length}
          onViewWorkOrder={() => setIsWorkOrderDialogOpen(true)}
        />
      </div>

      {/* Tag Image Viewer Dialog */}
      <TagImageDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        imageUrl={selectedTagImage}
      />

      {/* Add Company Dialog */}
      <AddCompanyMasterDialog
        open={isAddCompanyDialogOpen}
        onOpenChange={setIsAddCompanyDialogOpen}
        formData={companyFormData}
        onFormChange={setCompanyFormData}
        onConfirm={handleAddCompanyConfirm}
      />

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={isAddContactDialogOpen}
        onOpenChange={setIsAddContactDialogOpen}
        formData={contactFormData}
        onFormChange={setContactFormData}
        onConfirm={handleAddContactConfirm}
      />

      {/* Work Order Report Dialog */}
      <WorkOrderReportDialog
        open={isWorkOrderDialogOpen}
        onOpenChange={setIsWorkOrderDialogOpen}
        workOrderNumber={workOrderNumber}
        customerName={customerName}
        customerCode={customerCode}
        cylinders={lastWorkOrderCylinders}
        subtotal={subtotal}
        discountPercentage={discountPercentage}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
        contactName={
          contacts.find((c) => c.id.toString() === selectedContact)?.name
        }
        contactEmail={
          contacts.find((c) => c.id.toString() === selectedContact)?.email
        }
        contactPhone={
          contacts.find((c) => c.id.toString() === selectedContact)?.phone
        }
      />
    </div>
  );
}
