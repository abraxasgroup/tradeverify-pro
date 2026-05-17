import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/nav/Sidebar";
import { lazy, Suspense } from "react";
import { AnalyzingState } from "./components/ui/LoadingSpinner";
import { LevyAgent } from "./components/levy/LevyAgent";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const MarketIntelligence = lazy(() => import("./pages/market/MarketIntelligence"));
const TradeValidator = lazy(() => import("./pages/trade/TradeValidator"));
const ClientValidator = lazy(() => import("./pages/client/ClientValidator"));
const OfferBuilder = lazy(() => import("./pages/offer/OfferBuilder"));
const ReportExport = lazy(() => import("./pages/report/ReportExport"));
const Settings = lazy(() => import("./pages/Settings"));

function PageShell({ children }) {
  return (
    <Suspense fallback={<AnalyzingState label="Loading..." />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#07091a] text-slate-100 flex">
        <Sidebar />

        {/* Main content — offset by sidebar width */}
        <main className="flex-1 ml-16 min-h-screen overflow-x-hidden">
          <Routes>
            <Route path="/" element={<PageShell><Dashboard /></PageShell>} />
            <Route path="/market" element={<PageShell><MarketIntelligence /></PageShell>} />
            <Route path="/trade" element={<PageShell><TradeValidator /></PageShell>} />
            <Route path="/client" element={<PageShell><ClientValidator /></PageShell>} />
            <Route path="/offer" element={<PageShell><OfferBuilder /></PageShell>} />
            <Route path="/report" element={<PageShell><ReportExport /></PageShell>} />
            <Route path="/settings" element={<PageShell><Settings /></PageShell>} />
          </Routes>
        </main>

        {/* Levy Agent — global floating widget */}
        <LevyAgent />
      </div>
    </BrowserRouter>
  );
}
