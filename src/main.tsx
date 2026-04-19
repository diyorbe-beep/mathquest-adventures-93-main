import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { captureAttributionFromUrl } from "@/lib/attribution";

captureAttributionFromUrl();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found in index.html");

createRoot(rootElement).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
