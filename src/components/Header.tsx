import { LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import nattyGasLogo from "figma:asset/509bd1171d6cdbf113bf0bb7c8be00f47c2fdad0.png";

interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({
  isLoggedIn,
  userName: userNameProp,
  onLogin,
  onLogout,
}: HeaderProps) {
  const { user } = useAuth();

  const userName = userNameProp || user?.name || user?.email || "Guest User";
  const userRole = user?.role_name || "No Role";
  const userCompany = user?.company_name || "No Company";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="border-b bg-background">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl tracking-tight">
            <strong className="text-blue-600">LIMS</strong> -
          </h1>
          <img src={nattyGasLogo} alt="Natty Gas Lab" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <Avatar className="w-8 h-8 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm text-blue-600">{userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {userRole}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{userRole}</span>
                  </div>
                  {user?.company_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {userCompany}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLogin}>
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
