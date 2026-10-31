
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installApiSessionHandling } from "./setupApiSessionHandling";

installApiSessionHandling();

createRoot(document.getElementById("root")!).render(<App />);
  