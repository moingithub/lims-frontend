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
  Link2,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
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

const IMPORTS_MENU_ENABLED = false;

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { hasModuleAccessByName } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(orientation: portrait)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleChange = () => setIsCompact(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
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
    {
      id: "link-report",
      label: "Link Report",
      icon: <Link2 className="w-5 h-5 text-teal-500" />,
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
    {
      id: "map-analysis-position",
      label: "Map Analysis Position",
      icon: <MapPin className="w-5 h-5 text-indigo-500" />,
      section: "imports",
      moduleName: "import_machine_report",
    },
  ];

  const allReportItems: MenuItem[] = [
    {
      id: "analysis-reports",
      label: "Analysis Reports",
      icon: <FileText className="w-5 h-5 text-amber-500" />,
      section: "reports",
      moduleName: "analysis_reports",
    },
    {
      id: "cylinder-inventory",
      label: "Cylinder Inventory",
      icon: <ClipboardList className="w-5 h-5 text-teal-500" />,
      section: "reports",
      moduleName: "cylinder_inventory",
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
  const importItems = IMPORTS_MENU_ENABLED
    ? filterByPermission(allImportItems)
    : [];
  const reportItems = filterByPermission(allReportItems);
  const orderItems = filterByPermission(allOrderItems);
  const userItems = filterByPermission(allUserItems);

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      title={item.label}
      aria-label={item.label}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        isCompact ? "justify-center px-2.5" : ""
      } ${
        activePage === item.id
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span
        className={isCompact ? "flex h-5 w-5 items-center justify-center" : ""}
      >
        {item.icon}
      </span>
      {!isCompact && <span>{item.label}</span>}
    </button>
  );

  const renderSection = (
    title: string,
    items: MenuItem[],
    sectionId: string,
  ) => {
    // Don't render section if no items
    if (items.length === 0) return null;

    const isExpanded = expandedSection === sectionId;

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

  const renderFullSidebar = () => (
    <div className="flex h-full w-64 min-w-[14rem] shrink-0 flex-col border-r bg-background">
      <ScrollArea className="h-full min-h-0 flex-1">
        {menuItems.length > 0 && (
          <div className="space-y-0.5 py-2">
            {menuItems.map(renderMenuItem)}
          </div>
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

        {userItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {renderSection("User Management", userItems, "users")}
          </>
        )}
      </ScrollArea>
    </div>
  );

  if (isCompact) {
    const compactItems = [
      ...menuItems,
      ...reportItems,
      ...orderItems,
      ...masterItems,
      ...userItems,
      ...importItems,
    ];

    return (
      <div className="flex h-full w-16 min-w-16 shrink-0 flex-col border-r bg-background">
        <ScrollArea className="h-full min-h-0 flex-1">
          <div className="space-y-1 py-2">
            {compactItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${
                  activePage === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return renderFullSidebar();
}
