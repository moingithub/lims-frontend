import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { usersService } from "../../services/usersService";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundPassword, setFoundPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setEmail("");
    setFoundPassword(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFoundPassword(null);

    // Validate email
    if (!email || email.trim() === "") {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSearching(true);

    // Simulate searching delay
    setTimeout(() => {
      // Check if email exists in users service
      const users = usersService.getUsers();
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        if (!foundUser.active) {
          setError("This account has been deactivated. Please contact administrator.");
        } else {
          // In a real app, this would send an email
          // For demo purposes, we show the password
          setFoundPassword(foundUser.password);
        }
      } else {
        setError("No account found with this email address");
      }

      setIsSearching(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password?</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll help you recover your password
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isSearching}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {foundPassword && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">Account found!</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                  <p className="text-sm text-blue-900">
                    <strong>Demo Mode:</strong> In production, we would send a password reset link to your email.
                  </p>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-blue-800 mb-1">Your password is:</p>
                    <div className="bg-white p-2 rounded border border-blue-300">
                      <code className="text-blue-900 font-mono">{foundPassword}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {foundPassword ? (
              <Button type="button" onClick={handleClose} className="w-full">
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSearching}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Recover Password"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
