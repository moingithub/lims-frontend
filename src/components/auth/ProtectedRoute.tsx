// Protected Route Component - Guards routes based on authentication and permissions
import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  moduleId?: number;
  moduleName?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  moduleId,
  moduleName,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasModuleAccess, hasModuleAccessByName, user } = useAuth();

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check module access if moduleId or moduleName is provided
  if (moduleId && !hasModuleAccess(moduleId)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-destructive">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              You do not have permission to access this module.
            </p>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-semibold">{user?.role_name}</span>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (moduleName && !hasModuleAccessByName(moduleName)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-destructive">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              You do not have permission to access <span className="font-semibold">{moduleName}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-semibold">{user?.role_name}</span>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
