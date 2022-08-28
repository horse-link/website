import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import { createBrowserHistory } from "history";
import Dashboard from "./pages/Dashboard/Dashboard_Logic";
import HorseRace from "./pages/HorseRace/HorseRace_Logic";
import Vaults from "./pages/Vaults/Vaults_Logic";

export const history = createBrowserHistory();

const Navigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vaults" element={<Vaults />} />
        <Route path="/horses/:track/:number" element={<HorseRace />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Navigation;
