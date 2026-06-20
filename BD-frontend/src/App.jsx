// import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
// import React from "react";
// import Navbar from "./components/Navbar";

// import Home from "./components/HeroSection";
// import MissionSection from "./components/MissionSection";
// import HowToGetBlood from "./components/HowToGetBlood";
// import Footer from "./components/Footer";
// import RegisterDonor from "./components/RegisterDonor";
// import RegisterOrganization from "./components/RegisterOrganization";
// import FindBlood from "./components/FindBlood";
// import About from "./components/About";
// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import OrgDashboard         from "./pages/OrganizationDashboard/OrgDashboard";
// import DonorDashboard       from "./pages/DonorDashboard/DonorDashboard";
// import EditProfile          from "./pages/EditProfile/EditProfile";

// import "./App.css";


// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };


// function HomePage() {
//   return (
//     <>
//       <Home />
//       <MissionSection />
//       <HowToGetBlood />
//       <Footer />
//     </>
//   );
// }


// function Layout() {

//   const location = useLocation();

//   // hide navbar on dashboard
//   const hideNavbar = location.pathname === "/dashboard";

//   return (
//     <>
//       {!hideNavbar && <Navbar />}

//       <Routes>

//         <Route path="/" element={<HomePage />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/find-blood" element={<FindBlood />} />
//         <Route path="/register-donor" element={<RegisterDonor />} />
//         <Route path="/register-organization" element={<RegisterOrganization />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register/organization"  element={<RegisterOrganization />} />
// <Route path="/org/dashboard"          element={<OrgDashboard />} />
// <Route path="/donor/dashboard"        element={<DonorDashboard />} />
// <Route path="/donor/edit-profile"     element={<EditProfile />} />

//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//       </Routes>
//     </>
//   );
// }


// function App() {
//   return (
//     <BrowserRouter>
//       <Layout />
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";

import Home from "./components/HeroSection";
import MissionSection from "./components/MissionSection";
import HowToGetBlood from "./components/HowToGetBlood";
import Footer from "./components/Footer";
import RegisterDonor from "./components/RegisterDonor";
import RegisterOrganization from "./components/RegisterOrganization";
import FindBlood from "./components/FindBlood";
import About from "./components/About";
import Login from "./components/Login";

import OrgDashboard   from "./pages/OrganizationDashboard/OrgDashboard";
import DonorDashboard from "./pages/DonorDashboard/DonorDashboard";
import EditProfile    from "./pages/EditProfile/EditProfile";

import "./App.css";

// ── Dashboard paths where Navbar should be hidden ────────────────────────────
const DASHBOARD_PATHS = ["/donor/dashboard", "/org/dashboard", "/donor/edit-profile"];

// ── Generic protected route: just needs a token ──────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ── Role-specific protected route ────────────────────────────────────────────
const RoleRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role !== requiredRole) {
    // Wrong role — send to their own dashboard
    return <Navigate to={role === "organization" ? "/org/dashboard" : "/donor/dashboard"} replace />;
  }
  return children;
};

// ── Home page layout ─────────────────────────────────────────────────────────
function HomePage() {
  return (
    <>
      <Home />
      <MissionSection />
      <HowToGetBlood />
      <Footer />
    </>
  );
}

// ── Layout: controls Navbar visibility ───────────────────────────────────────
function Layout() {
  const location = useLocation();
  const hideNavbar = DASHBOARD_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/"                       element={<HomePage />} />
        <Route path="/about"                  element={<About />} />
        <Route path="/find-blood"             element={<FindBlood />} />
        <Route path="/register-donor"         element={<RegisterDonor />} />
        <Route path="/register-organization"  element={<RegisterOrganization />} />
        <Route path="/login"                  element={<Login />} />

        {/* Donor-only routes */}
        <Route
          path="/donor/dashboard"
          element={
            <RoleRoute requiredRole="donor">
              <DonorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/donor/edit-profile"
          element={
            <RoleRoute requiredRole="donor">
              <EditProfile />
            </RoleRoute>
          }
        />

        {/* Organization-only routes */}
        <Route
          path="/org/dashboard"
          element={
            <RoleRoute requiredRole="organization">
              <OrgDashboard />
            </RoleRoute>
          }
        />

        {/* Catch old /dashboard route — redirect by role */}
        <Route
          path="/dashboard"
          element={<RoleRedirect />}
        />
        <Route
          path="/donordashboard"
          element={<RoleRedirect />}
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Redirects to the correct dashboard based on role stored in localStorage
function RoleRedirect() {
  const role = localStorage.getItem("role");
  if (role === "organization") return <Navigate to="/org/dashboard" replace />;
  if (role === "donor")        return <Navigate to="/donor/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// ── App root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;