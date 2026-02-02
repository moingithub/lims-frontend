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
import { Contact, contactsService } from "../services/contactsService";
import { SearchBar } from "../components/shared/SearchBar";
import { ContactsTable } from "../components/contacts/ContactsTable";
import { AddContactDialog } from "../components/contacts/AddContactDialog";
import { EditContactDialog } from "../components/contacts/EditContactDialog";
import { DeleteContactDialog } from "../components/contacts/DeleteContactDialog";
import { ContactFormData } from "../components/contacts/ContactForm";

export function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    id: 0,
    company_id: 0,
    name: "",
    phone: "",
    email: "",
    active: true,
  });

  const [contactData, setContactData] = useState<Contact[]>(
    contactsService.getContacts(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadContacts = async () => {
      try {
        const contacts = await contactsService.fetchContacts();
        if (isMounted) setContactData(contacts);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load contacts";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContacts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = contactsService.searchContacts(contactData, searchTerm);

  const handleAdd = () => {
    setFormData({
      id: 0,
      company_id: 0,
      name: "",
      phone: "",
      email: "",
      active: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      id: contact.id,
      company_id: contact.company_id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      active: contact.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const validation = contactsService.validateContact(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }
    try {
      const addedContact = await contactsService.addContact({
        company_id: formData.company_id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        active: formData.active,
      });
      const updatedContacts = [...contactData, addedContact];
      setContactData(updatedContacts);
      contactsService.setContacts(updatedContacts);
      toast.success(`Contact ${addedContact.name} added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create contact";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    if (!selectedContact) return;

    const validation = contactsService.validateContact(formData);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    try {
      const updatedContact = await contactsService.updateContact(
        selectedContact.id,
        {
          id: selectedContact.id,
          company_id: formData.company_id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          active: formData.active,
        },
      );
      const updatedContacts = contactData.map((c) =>
        c.id === selectedContact.id ? updatedContact : c,
      );
      setContactData(updatedContacts);
      contactsService.setContacts(updatedContacts);
      toast.success(`Contact ${updatedContact.name} updated successfully`);
      setIsEditDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update contact";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;

    try {
      await contactsService.deleteContact(selectedContact.id);
      const updatedContacts = contactData.filter(
        (c) => c.id !== selectedContact.id,
      );
      setContactData(updatedContacts);
      contactsService.setContacts(updatedContacts);
      toast.success(`Contact ${selectedContact.name} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete contact";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">Contacts</CardTitle>
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
              placeholder="Search contacts..."
            />
          </div>

          <ContactsTable
            contacts={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredData.length} of {contactData.length} contacts
            </p>
          </div>
        </CardContent>
      </Card>

      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditContactDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteContactDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        contactName={selectedContact?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
