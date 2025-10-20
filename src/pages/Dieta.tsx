import { Outlet, useLocation } from "react-router-dom";
import DietHub from "@/pages/dieta/Index";

export default function Dieta() {
  const { pathname } = useLocation();
  const isHub = pathname === "/dieta" || pathname === "/dieta/";
  return isHub ? <DietHub /> : <Outlet />;
}