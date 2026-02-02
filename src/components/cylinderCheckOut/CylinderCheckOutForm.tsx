import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Company } from "../../services/companyMasterService";
import { Contact } from "../../services/contactsService";

interface CylinderCheckOutFormProps {
  customerCode: string;
  selectedContact: string;
  customers: Company[];
  contacts: Contact[];
  isLoadingCompanies?: boolean;
  onCustomerChange: (code: string) => void;
  onContactChange: (contactId: string) => void;
  onAddCustomer: () => void;
  onAddContact: () => void;
}

export function CylinderCheckOutForm({
  customerCode,
  selectedContact,
  customers,
  contacts,
  isLoadingCompanies,
  onCustomerChange,
  onContactChange,
  onAddCustomer,
  onAddContact,
}: CylinderCheckOutFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Company</Label>
        <div className="flex gap-2">
          <Select
            value={customerCode}
            onValueChange={onCustomerChange}
            disabled={isLoadingCompanies}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingCompanies ? "Loading companies..." : "Select company"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem
                  key={customer.company_code}
                  value={customer.company_code}
                >
                  {customer.company_name} ({customer.company_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddCustomer}
            title="Add New Customer"
            disabled={isLoadingCompanies}
          >
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
            disabled={!customerCode || isLoadingCompanies}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingCompanies
                    ? "Loading contacts..."
                    : customerCode
                      ? "Select contact"
                      : "Select company first"
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
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddContact}
            disabled={!customerCode || isLoadingCompanies}
            title="Add New Contact"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
