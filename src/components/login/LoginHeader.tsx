import { ImageWithFallback } from "../figma/ImageWithFallback";
import nattyGasLogo from "figma:asset/509bd1171d6cdbf113bf0bb7c8be00f47c2fdad0.png";

export function LoginHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center mb-4">
        <img
          src={nattyGasLogo}
          alt="Natty Gas Lab Logo"
          className="h-20"
        />
      </div>
      <p className="text-muted-foreground">Laboratory Information Management System</p>
    </div>
  );
}
