import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProgressProvider } from "./lib/store";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Start from "./pages/Start";
import Dashboard from "./pages/Dashboard";
import Journey from "./pages/Journey";
import LessonView from "./pages/LessonView";
import Challenge from "./pages/Challenge";
import Parent from "./pages/Parent";

/** Every page/section navigation starts at the top of the page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/start" element={<Start />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/lesson/:id" element={<LessonView />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/parent" element={<Parent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ProgressProvider>
  );
}
