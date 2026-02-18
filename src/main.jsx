import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProviders } from "./providers/AppProviders.jsx";

createRoot(document.getElementById("root")).render(
  <AppProviders>
    <App />
  </AppProviders>,
);
