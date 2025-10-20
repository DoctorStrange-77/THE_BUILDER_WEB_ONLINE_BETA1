import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    const id = window.netlifyIdentity;
    if (!id) return;
    id.init();

    const goHome = () => window.location.replace("/");
    id.on("login", goHome);
    id.on("signup", goHome);
    id.on("init", (user: any) => { if (user) goHome(); });

    return () => {
      id.off("login", goHome);
      id.off("signup", goHome);
      // @ts-ignore
      id.off("init", goHome);
    };
  }, []);

  return (
    <main style={{ minHeight:"100vh", display:"grid", placeItems:"center" }}>
      <div style={{ textAlign:"center" }}>
        <h1>Accedi</h1>
        <p>Entra con l’account invitato</p>
        <button onClick={() => window.netlifyIdentity?.open("login")}>Login</button>
      </div>
    </main>
  );
}
