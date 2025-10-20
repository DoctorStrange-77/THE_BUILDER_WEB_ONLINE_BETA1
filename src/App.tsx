import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import React, { Suspense } from "react";

const TemplateSplitPage = React.lazy(() => import("@/modules/template-split"));
import Home from "./pages/Home";
import Atleti from "./pages/Atleti";
import AtletaDettaglio from "./pages/AtletaDettaglio";
import Schede from "./pages/Schede";
import Progressioni from "./pages/Progressioni";
import Esercizi from "./pages/Esercizi";
import Distretti from "./pages/Distretti";
import Dieta from "./pages/Dieta";
import NotFound from "./pages/NotFound";
import DietPage from "./pages/dieta/Diet";
import DietTimingTemplates from "./pages/dieta/TimingTemplates";
import DietFoodDatabase from "./pages/dieta/FoodDatabase";
import DietSupplements from "./pages/dieta/Supplements";
import DietHub from "./pages/dieta/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/atleti" element={<Atleti />} />
            <Route path="/atleti/:id" element={<AtletaDettaglio />} />
            <Route path="/schede" element={<Schede />} />
            <Route path="/progressioni" element={<Progressioni />} />
            <Route path="/esercizi" element={<Esercizi />} />
            <Route path="/distretti" element={<Distretti />} />
            <Route path="/dieta" element={<Dieta />} />
            <Route path="/dieta/diet" element={<DietPage />} />
            <Route path="/dieta/timing-templates" element={<DietTimingTemplates />} />
            <Route path="/dieta/food-database" element={<DietFoodDatabase />} />
            <Route path="/dieta/supplements" element={<DietSupplements />} />
            <Route path="/template-split" element={
              <Suspense fallback={<div>Caricamento Template Split...</div>}>
                <TemplateSplitPage />
              </Suspense>
            } />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/dieta" element={<Dieta />} />
  <Route path="/dieta/diet" element={<DietPage />} />
  <Route path="/dieta/timing-templates" element={<DietTimingTemplates />} />
  <Route path="/dieta/food-database" element={<DietFoodDatabase />} />
  <Route path="/dieta/supplements" element={<DietSupplements />} />
</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;