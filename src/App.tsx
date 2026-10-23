import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import DeliveryDetail from "./pages/DeliveryDetail";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/deliveries"
              element={<Deliveries />}
            />

            <Route
              path="/deliveries/:id"
              element={<DeliveryDetail />}
            />

            <Route
              path="/drivers"
              element={<Drivers />}
            />

            <Route
              path="/vehicles"
              element={<Vehicles />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;