import { useLocation, Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dumbbell } from "lucide-react";
import logoWebp from "@/assets/logo.webp";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 gap-4">
            <SidebarTrigger className="text-foreground hover:text-primary transition-colors" />
            <div className="flex items-center gap-3">
              <img src={logoWebp} alt="Logo" className="h-8 w-auto" />
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  THE BUILDER WEB
                </h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
