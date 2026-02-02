import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Contact } from "../../services/contactsService";
import { Company } from "../../services/companyMasterService";

interface CompanyContactSelectorProps {
  customerCode: string;
  selectedContact: string;
  customers: Company[];
  contacts: Contact[];
  onCustomerChange: (code: string) => void;
  onContactChange: (contactId: string) => void;
  onAddCompany: () => void;
  onAddContact: () => void;
}

export function CompanyContactSelector({
  customerCode,
  selectedContact,
  customers,
  contacts,
  onCustomerChange,
  onContactChange,
  onAddCompany,
  onAddContact,
}: CompanyContactSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Company</Label>
        <div className="flex gap-2">
          <Select value={customerCode} onValueChange={onCustomerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.company_code} value={customer.company_code}>
                  {customer.company_name} ({customer.company_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onAddCompany}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contact</Label>
        <div className="flex gap-2">
          <Select
            value={selectedContact}
            onValueChange={onContactChange}
            disabled={!customerCode}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  customerCode ? "Select contact" : "Select company first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id.toString()}>
                  {contact.name} - {contact.email} - {contact.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={onAddContact}
            disabled={!customerCode}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}