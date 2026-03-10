import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { LoginHeader } from "../components/login/LoginHeader";
import { LoginForm, LoginFormData } from "../components/login/LoginForm";
import { ForgotPasswordDialog } from "../components/login/ForgotPasswordDialog";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  // Load remembered email from localStorage
  const rememberedEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("lims_remembered_email") || ""
      : "";
  const [formData, setFormData] = useState<LoginFormData>({
    email: rememberedEmail,
    password: "",
    remember_me: !!rememberedEmail,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    // Handle remember me
    if (formData.remember_me) {
      localStorage.setItem("lims_remembered_email", formData.email);
    } else {
      localStorage.removeItem("lims_remembered_email");
    }

    setIsLoading(true);

    try {
      // Perform login - use email field as username
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success("Login successful!");
        onLoginSuccess();
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader />

        <LoginForm
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onForgotPassword={() => setIsForgotPasswordOpen(true)}
        />

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
