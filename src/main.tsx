import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import Login from "./pages/Login.tsx";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Inizializza Netlify Identity e aggiorna lo stato utente
    window.netlifyIdentity?.init();
    const update = () => setUser(window.netlifyIdentity?.currentUser() || null);
    update();
    window.netlifyIdentity?.on("login", update);
    window.netlifyIdentity?.on("logout", update);
    setReady(true);
    return () => {
      window.netlifyIdentity?.off("login", update);
      window.netlifyIdentity?.off("logout", update);
    };
  }, []);

  if (!ready) return null; // oppure uno spinner di caricamento
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Tutto il resto dell'app è protetto: */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
