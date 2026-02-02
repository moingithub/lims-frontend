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
import faviconImage from "figma:asset/da3a8019dc769c6ee77d3527d69202b460a32a75.png";

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    // Set favicon
    const link =
      (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href = faviconImage;
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  const handleLoginSuccess = () => {
    // Just trigger a re-render, auth state is managed by context
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
          <ProtectedRoute moduleId={1}>
            <Dashboard />
          </ProtectedRoute>
        );

      case "cylinder-checkout":
        return (
          <ProtectedRoute moduleId={2}>
            <CylinderCheckOut currentUser={user} />
          </ProtectedRoute>
        );

      case "sample-checkin":
        return (
          <ProtectedRoute moduleId={3}>
            <SampleCheckIn onNavigate={setActivePage} />
          </ProtectedRoute>
        );

      case "analysis-pricing":
        return (
          <ProtectedRoute moduleId={7}>
            <AnalysisPricing />
          </ProtectedRoute>
        );

      case "cylinder-master":
        return (
          <ProtectedRoute moduleId={8}>
            <CylinderMaster currentUser={user} />
          </ProtectedRoute>
        );

      case "company-master":
        return (
          <ProtectedRoute moduleId={9}>
            <CompanyMaster />
          </ProtectedRoute>
        );

      case "contacts":
        return (
          <ProtectedRoute moduleId={10}>
            <Contacts />
          </ProtectedRoute>
        );

      case "cylinder-inventory":
        return (
          <ProtectedRoute moduleId={13}>
            <CylinderInventory />
          </ProtectedRoute>
        );

      case "analysis-reports":
        return (
          <ProtectedRoute moduleId={14}>
            <AnalysisReports />
          </ProtectedRoute>
        );

      case "pending-orders":
        return (
          <ProtectedRoute moduleId={15}>
            <PendingOrders />
          </ProtectedRoute>
        );

      case "work-orders":
        return (
          <ProtectedRoute moduleId={4}>
            <WorkOrders />
          </ProtectedRoute>
        );

      case "sales-invoices":
        return (
          <ProtectedRoute moduleId={5}>
            <GenerateInvoices />
          </ProtectedRoute>
        );

      case "invoices":
        return (
          <ProtectedRoute moduleId={6}>
            <Invoices />
          </ProtectedRoute>
        );

      case "users":
        return (
          <ProtectedRoute moduleId={17}>
            <Users />
          </ProtectedRoute>
        );

      case "roles":
        return (
          <ProtectedRoute moduleId={16}>
            <Roles />
          </ProtectedRoute>
        );

      case "modules":
        return (
          <ProtectedRoute moduleId={18}>
            <Modules />
          </ProtectedRoute>
        );

      case "role-module":
        return (
          <ProtectedRoute moduleId={19}>
            <RoleModule />
          </ProtectedRoute>
        );

      case "company-area":
        return (
          <ProtectedRoute moduleId={11}>
            <CompanyArea />
          </ProtectedRoute>
        );

      case "import-machine-report":
        return (
          <ProtectedRoute moduleId={12}>
            <ImportMachineReport />
          </ProtectedRoute>
        );

      default:
        return (
          <ProtectedRoute moduleId={1}>
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
