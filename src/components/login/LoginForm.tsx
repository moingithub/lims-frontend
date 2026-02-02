import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Lock, Mail } from "lucide-react";

export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

interface LoginFormProps {
  formData: LoginFormData;
  onFormChange: (data: LoginFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

export function LoginForm({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
  onForgotPassword,
}: LoginFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@lims.com"
                value={formData.email}
                onChange={(e) =>
                  onFormChange({ ...formData, email: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  onFormChange({ ...formData, password: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.remember_me}
                onCheckedChange={(checked) =>
                  onFormChange({ ...formData, remember_me: checked as boolean })
                }
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-sm cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>
            <Button
              variant="link"
              className="px-0 h-auto"
              type="button"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <div className="text-center text-sm text-muted-foreground space-y-3">
            <div>
              <p className="mb-2">Quick Login Credentials:</p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-blue-600 mb-1">
                  Administrator (Full Access)
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">admin@lims.com</span> /{" "}
                  <span className="font-semibold">admin123!</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
