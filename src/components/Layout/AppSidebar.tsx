import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebarContext";
import { Home, Users, ClipboardList, TrendingUp, Dumbbell, Target, Apple, Columns } from "lucide-react";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Atleti", url: "/atleti", icon: Users },
  { title: "Schede", url: "/schede", icon: ClipboardList },
  { title: "Progressioni", url: "/progressioni", icon: TrendingUp },
  { title: "Esercizi", url: "/esercizi", icon: Dumbbell },
  { title: "Distretti", url: "/distretti", icon: Target },
  { title: "Dieta", url: "/dieta", icon: Apple },
  { title: "Template Split", url: "/template-split", icon: Columns },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Menu Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-primary font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
