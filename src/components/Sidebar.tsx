import { 
  LayoutDashboard, 
  PackageCheck, 
  PackagePlus, 
  Database,
  Cylinder,
  Users,
  UserCircle,
  FileText,
  ClipboardList,
  ShoppingCart,
  UserCog,
  Shield,
  Layout,
  ChevronDown,
  ChevronRight,
  Receipt,
  FileSpreadsheet,
  DollarSign,
  MapPin,
  Wrench,
  FileInput
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  moduleId: number; // Module ID for permission check
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { hasModuleAccess } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "masters", "reports", "orders", "users", "imports"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // All menu items with their corresponding module IDs
  const allMenuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />, moduleId: 1 },
    { id: "cylinder-checkout", label: "Cylinder Check-Out", icon: <PackagePlus className="w-5 h-5 text-green-500" />, moduleId: 2 },
    { id: "sample-checkin", label: "Sample Check-In", icon: <PackageCheck className="w-5 h-5 text-purple-500" />, moduleId: 3 },
  ];

  const allMasterItems: MenuItem[] = [
    { id: "analysis-pricing", label: "Analysis Pricing", icon: <Database className="w-5 h-5 text-cyan-500" />, section: "masters", moduleId: 7 },
    { id: "cylinder-master", label: "Cylinder Master", icon: <Cylinder className="w-5 h-5 text-indigo-500" />, section: "masters", moduleId: 8 },
    { id: "company-master", label: "Company Master", icon: <Users className="w-5 h-5 text-pink-500" />, section: "masters", moduleId: 9 },
    { id: "contacts", label: "Contacts", icon: <UserCircle className="w-5 h-5 text-orange-500" />, section: "masters", moduleId: 10 },
    { id: "company-area", label: "Company Area", icon: <MapPin className="w-5 h-5 text-rose-500" />, section: "masters", moduleId: 11 },
  ];

  const allImportItems: MenuItem[] = [
    { id: "import-machine-report", label: "Import Machine Report", icon: <FileInput className="w-5 h-5 text-lime-500" />, section: "imports", moduleId: 12 },
  ];

  const allReportItems: MenuItem[] = [
    { id: "cylinder-inventory", label: "Cylinder Inventory", icon: <ClipboardList className="w-5 h-5 text-teal-500" />, section: "reports", moduleId: 13 },
    { id: "analysis-reports", label: "Analysis Reports", icon: <FileText className="w-5 h-5 text-amber-500" />, section: "reports", moduleId: 14 },
    { id: "pending-orders", label: "Pending Work Orders", icon: <ClipboardList className="w-5 h-5 text-red-500" />, section: "reports", moduleId: 15 },
  ];

  const allOrderItems: MenuItem[] = [
    { id: "work-orders", label: "Work Orders", icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />, section: "orders", moduleId: 4 },
    { id: "sales-invoices", label: "Generate Invoice", icon: <FileSpreadsheet className="w-5 h-5 text-blue-500" />, section: "orders", moduleId: 5 },
    { id: "invoices", label: "Invoices", icon: <Receipt className="w-5 h-5 text-violet-500" />, section: "orders", moduleId: 6 },
  ];

  const allUserItems: MenuItem[] = [
    { id: "roles", label: "Roles", icon: <Shield className="w-5 h-5 text-rose-500" />, section: "users", moduleId: 16 },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5 text-sky-500" />, section: "users", moduleId: 17 },
    { id: "modules", label: "Modules", icon: <Layout className="w-5 h-5 text-fuchsia-500" />, section: "users", moduleId: 18 },
    { id: "role-module", label: "Role Module", icon: <Shield className="w-5 h-5 text-yellow-500" />, section: "users", moduleId: 19 },
  ];

  // Filter menu items based on user permissions
  const filterByPermission = (items: MenuItem[]) => {
    return items.filter(item => hasModuleAccess(item.moduleId));
  };

  const menuItems = filterByPermission(allMenuItems);
  const masterItems = filterByPermission(allMasterItems);
  const importItems = filterByPermission(allImportItems);
  const reportItems = filterByPermission(allReportItems);
  const orderItems = filterByPermission(allOrderItems);
  const userItems = filterByPermission(allUserItems);

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        activePage === item.id
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  );

  const renderSection = (title: string, items: MenuItem[], sectionId: string) => {
    // Don't render section if no items
    if (items.length === 0) return null;
    
    const isExpanded = expandedSections.includes(sectionId);
    
    return (
      <div key={sectionId}>
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{title}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <div className="space-y-0.5">
            {items.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-background h-screen flex flex-col">
      <ScrollArea className="flex-1">
        {menuItems.length > 0 && (
          <div className="py-2 space-y-0.5">
            {menuItems.map(renderMenuItem)}
          </div>
        )}

        {orderItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("Orders", orderItems, "orders")}
          </>
        )}

        {masterItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("Masters", masterItems, "masters")}
          </>
        )}

        {importItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("Imports", importItems, "imports")}
          </>
        )}

        {reportItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("Reports", reportItems, "reports")}
          </>
        )}

        {userItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("User Management", userItems, "users")}
          </>
        )}
      </ScrollArea>
    </div>
  );
}