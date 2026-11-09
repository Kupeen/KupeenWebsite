import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Placeholder until the design is in: shows that the page and the API work.
function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Kupéen</h1>
      <p>Hjemmesiden er under opbygning.</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
