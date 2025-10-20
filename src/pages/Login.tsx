// src/pages/Login.tsx
import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.netlifyIdentity?.init();
    const onLogin = () => (window.location.href = "/");
    window.netlifyIdentity?.on("login", onLogin);
    return () => window.netlifyIdentity?.off("login", onLogin);
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Accedi</h1>
        <p>Entra con l’account invitato</p>
        <button
          onClick={() => window.netlifyIdentity?.open("login")}
          style={{ padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}
        >
          Login
        </button>
      </div>
    </main>
  );
}
