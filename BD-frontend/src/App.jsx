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
import Dashboard from "./components/Dashboard";

import "./App.css";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};


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


function Layout() {

  const location = useLocation();

  // hide navbar on dashboard
  const hideNavbar = location.pathname === "/dashboard";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/find-blood" element={<FindBlood />} />
        <Route path="/register-donor" element={<RegisterDonor />} />
        <Route path="/register-organization" element={<RegisterOrganization />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;