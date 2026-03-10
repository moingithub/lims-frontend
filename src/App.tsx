import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LoginScreen } from "./pages/LoginScreen";
import { Dashboard } from "./pages/Dashboard";
import { CompanyMaster } from "./pages/CompanyMaster";
import { RoleModule } from "./pages/RoleModule";
import { CompanyArea } from "./pages/CompanyArea";
import { AnalysisPricing } from "./pages/AnalysisPricing";
import { CylinderMaster } from "./pages/CylinderMaster";
import { Contacts } from "./pages/Contacts";
import { CylinderInventory } from "./pages/CylinderInventory";
import { AnalysisReports } from "./pages/AnalysisReports";
import { PendingOrders } from "./pages/PendingOrders";
import React, { Suspense } from "react";
const OpenCheckoutsLazy = React.lazy(() => import("./pages/OpenCheckouts"));
import { Roles } from "./pages/Roles";
import { Users } from "./pages/Users";
import { Modules } from "./pages/Modules";
import { Toaster } from "./components/ui/sonner";
import { CylinderCheckOut } from "./pages/CylinderCheckOut";
import { SampleCheckIn } from "./pages/SampleCheckIn";
import { WorkOrders } from "./pages/WorkOrders";
import { GenerateInvoices } from "./pages/GenerateInvoices";
import { Invoices } from "./pages/Invoices";
import { ImportMachineReport } from "./pages/ImportMachineReport";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function AppContent() {
  const {
    isAuthenticated,
    logout,
    user,
    permissions,
    hasModuleAccess,
    hasModuleAccessByName,
  } = useAuth();
  const [activePage, setActivePage] = useState<string>("dashboard");

  useEffect(() => {
    // On initial load, if authenticated, check if default page is accessible
    if (isAuthenticated) {
      // If dashboard is not accessible, redirect to first accessible module
      if (!hasModuleAccessByName("dashboard")) {
        // Find first accessible module from permissions
        const firstModule = permissions.find((p) => p.active);
        if (firstModule) {
          // Map module_id to page name (keep in sync with backend IDs)
          const moduleIdToPage: { [key: number]: string } = {
            1: "dashboard",
            2: "cylinder-checkout",
            3: "sample-checkin",
            4: "work-orders",
            5: "sales-invoices",
            6: "invoices",
            7: "analysis-pricing",
            8: "cylinder-master",
            9: "company-master",
            10: "contacts",
            11: "company-area",
            12: "import-machine-report",
            13: "cylinder-inventory",
            14: "analysis-reports",
            15: "pending-orders",
            16: "roles",
            17: "users",
            18: "modules",
            19: "role-module",
          };
          const page = moduleIdToPage[firstModule.module_id] || "dashboard";
          setActivePage(page);
        }
      }
    }
  }, [isAuthenticated, permissions, hasModuleAccess]);

  const handleLoginSuccess = () => {
    // After login, redirect to first accessible module if dashboard is not accessible
    if (!hasModuleAccessByName("dashboard")) {
      const firstModule = permissions.find((p) => p.active);
      if (firstModule) {
        const moduleIdToPage: { [key: number]: string } = {
          1: "dashboard",
          2: "cylinder-checkout",
          3: "sample-checkin",
          4: "work-orders",
          5: "sales-invoices",
          6: "invoices",
          7: "analysis-pricing",
          8: "cylinder-master",
          9: "company-master",
          10: "contacts",
          11: "company-area",
          12: "import-machine-report",
          13: "cylinder-inventory",
          14: "analysis-reports",
          15: "pending-orders",
          16: "roles",
          17: "users",
          18: "modules",
          19: "role-module",
        };
        const page = moduleIdToPage[firstModule.module_id] || "dashboard";
        setActivePage(page);
        return;
      }
    }
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      setActivePage("dashboard");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <ProtectedRoute moduleName="dashboard">
            <Dashboard />
          </ProtectedRoute>
        );

      case "cylinder-checkout":
        return (
          <ProtectedRoute moduleName="cylinder_checkout">
            <CylinderCheckOut currentUser={user} />
          </ProtectedRoute>
        );

      case "sample-checkin":
        return (
          <ProtectedRoute moduleName="sample_checkin">
            <SampleCheckIn onNavigate={setActivePage} />
          </ProtectedRoute>
        );

      case "analysis-pricing":
        return (
          <ProtectedRoute moduleName="analysis_pricing">
            <AnalysisPricing />
          </ProtectedRoute>
        );

      case "cylinder-master":
        return (
          <ProtectedRoute moduleName="cylinder_master">
            <CylinderMaster currentUser={user} />
          </ProtectedRoute>
        );

      case "company-master":
        return (
          <ProtectedRoute moduleName="company_master">
            <CompanyMaster />
          </ProtectedRoute>
        );

      case "contacts":
        return (
          <ProtectedRoute moduleName="contacts">
            <Contacts />
          </ProtectedRoute>
        );

      case "cylinder-inventory":
        return (
          <ProtectedRoute moduleName="cylinder_inventory">
            <CylinderInventory />
          </ProtectedRoute>
        );

      case "analysis-reports":
        return (
          <ProtectedRoute moduleName="analysis_reports">
            <AnalysisReports />
          </ProtectedRoute>
        );

      case "pending-orders":
        return (
          <ProtectedRoute moduleName="pending_work_orders">
            <PendingOrders />
          </ProtectedRoute>
        );

      case "open-checkouts":
        return (
          <ProtectedRoute moduleName="open_checkouts">
            <Suspense fallback={<div>Loading...</div>}>
              <OpenCheckoutsLazy />
            </Suspense>
          </ProtectedRoute>
        );

      case "work-orders":
        return (
          <ProtectedRoute moduleName="work_orders">
            <WorkOrders />
          </ProtectedRoute>
        );

      case "sales-invoices":
        return (
          <ProtectedRoute moduleName="generate_invoice">
            <GenerateInvoices />
          </ProtectedRoute>
        );

      case "invoices":
        return (
          <ProtectedRoute moduleName="invoices">
            <Invoices />
          </ProtectedRoute>
        );

      case "users":
        return (
          <ProtectedRoute moduleName="users">
            <Users />
          </ProtectedRoute>
        );

      case "roles":
        return (
          <ProtectedRoute moduleName="roles">
            <Roles />
          </ProtectedRoute>
        );

      case "modules":
        return (
          <ProtectedRoute moduleName="modules">
            <Modules />
          </ProtectedRoute>
        );

      case "role-module":
        return (
          <ProtectedRoute moduleName="role_modules">
            <RoleModule />
          </ProtectedRoute>
        );

      case "company-area":
        return (
          <ProtectedRoute moduleName="company_areas">
            <CompanyArea />
          </ProtectedRoute>
        );

      case "import-machine-report":
        return (
          <ProtectedRoute moduleName="import_machine_report">
            <ImportMachineReport />
          </ProtectedRoute>
        );

      default:
        return (
          <ProtectedRoute moduleName="dashboard">
            <Dashboard />
          </ProtectedRoute>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background flex-col">
      <Header
        isLoggedIn={isAuthenticated}
        userName={user?.name}
        onLogin={handleLoginSuccess}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">{renderPage()}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
