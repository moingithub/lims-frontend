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
  FileInput,
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
  moduleName: string; // Stable backend module name, e.g. "cylinder_checkout"
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { hasModuleAccessByName } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "masters",
    "reports",
    "orders",
    "users",
    "imports",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  // All menu items with their corresponding module IDs
  const allMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />,
      moduleName: "dashboard",
    },
    {
      id: "cylinder-checkout",
      label: "Cylinder Check-Out",
      icon: <PackagePlus className="w-5 h-5 text-green-500" />,
      moduleName: "cylinder_checkout",
    },
    {
      id: "sample-checkin",
      label: "Sample Check-In",
      icon: <PackageCheck className="w-5 h-5 text-purple-500" />,
      moduleName: "sample_checkin",
    },
  ];

  const allMasterItems: MenuItem[] = [
    {
      id: "analysis-pricing",
      label: "Analysis Pricing",
      icon: <Database className="w-5 h-5 text-cyan-500" />,
      section: "masters",
      moduleName: "analysis_pricing",
    },
    {
      id: "cylinder-master",
      label: "Cylinder Master",
      icon: <Cylinder className="w-5 h-5 text-indigo-500" />,
      section: "masters",
      moduleName: "cylinder_master",
    },
    {
      id: "company-master",
      label: "Company Master",
      icon: <Users className="w-5 h-5 text-pink-500" />,
      section: "masters",
      moduleName: "company_master",
    },

    {
      id: "company-area",
      label: "Company Area",
      icon: <MapPin className="w-5 h-5 text-rose-500" />,
      section: "masters",
      moduleName: "company_areas",
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: <UserCircle className="w-5 h-5 text-orange-500" />,
      section: "masters",
      moduleName: "contacts",
    },
  ];

  const allImportItems: MenuItem[] = [
    {
      id: "import-machine-report",
      label: "Import Machine Report",
      icon: <FileInput className="w-5 h-5 text-lime-500" />,
      section: "imports",
      moduleName: "import_machine_report",
    },
  ];

  const allReportItems: MenuItem[] = [
    {
      id: "cylinder-inventory",
      label: "Cylinder Inventory",
      icon: <ClipboardList className="w-5 h-5 text-teal-500" />,
      section: "reports",
      moduleName: "cylinder_inventory",
    },
    {
      id: "analysis-reports",
      label: "Analysis Reports",
      icon: <FileText className="w-5 h-5 text-amber-500" />,
      section: "reports",
      moduleName: "analysis_reports",
    },
    // Pending Work Orders menu hidden
    {
      id: "open-checkouts",
      label: "Open Checkouts",
      icon: <PackageCheck className="w-5 h-5 text-blue-500" />,
      section: "reports",
      moduleName: "open_checkouts",
    },
  ];

  const allOrderItems: MenuItem[] = [
    {
      id: "work-orders",
      label: "Work Orders",
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
      section: "orders",
      moduleName: "work_orders",
    },
    {
      id: "sales-invoices",
      label: "Generate Invoice",
      icon: <FileSpreadsheet className="w-5 h-5 text-blue-500" />,
      section: "orders",
      moduleName: "generate_invoice",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: <Receipt className="w-5 h-5 text-violet-500" />,
      section: "orders",
      moduleName: "invoices",
    },
  ];

  const allUserItems: MenuItem[] = [
    {
      id: "roles",
      label: "Roles",
      icon: <Shield className="w-5 h-5 text-rose-500" />,
      section: "users",
      moduleName: "roles",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="w-5 h-5 text-sky-500" />,
      section: "users",
      moduleName: "users",
    },
    {
      id: "modules",
      label: "Modules",
      icon: <Layout className="w-5 h-5 text-fuchsia-500" />,
      section: "users",
      moduleName: "modules",
    },
    {
      id: "role-module",
      label: "Role Module",
      icon: <Shield className="w-5 h-5 text-yellow-500" />,
      section: "users",
      moduleName: "role_modules",
    },
  ];

  // Filter menu items based on user permissions
  const filterByPermission = (items: MenuItem[]) => {
    return items.filter((item) => hasModuleAccessByName(item.moduleName));
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

  const renderSection = (
    title: string,
    items: MenuItem[],
    sectionId: string,
  ) => {
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
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-0.5">{items.map(renderMenuItem)}</div>
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
