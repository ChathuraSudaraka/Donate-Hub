import React from "react";
import Navigation_bar from "./Navigation_bar.js";
import Home from "./Home.js";
import About from "./About.js";
import Services from "./Services.js";
import Buy_And_Sale from "./Buy_And_Sale.js";
import Contact from "./Contact.js";
import ProductSingle from "./[id].js";
import DonationSingle from "./DonationSingle.js";
import Buy from "./Buy.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sale from "./Sale.js";
import Sale_Add_Item from "./Sale_Add_Item.js";
import Add_Item_form from "./Add_Item_form.js";
import Register from "./auth/register/Register.js";
import Login from "./auth/login/login.js";
import ForgotPassword from "./auth/forgot-password/ForgotPassword.js";
import ResetPassword from "./auth/reset-password/ResetPassword.js";
import { AuthProvider } from "./contexts/AuthContext.js";
import { ThemeProvider } from "./contexts/ThemeContext.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import Dashboard from "./components/Dashboard.js";
import EditProductForm from "./components/EditProductForm.js";
import Layout from "./components/Layout.js";
import ScrollToTop from "./components/ScrollToTop.js";
import "./styles/themes.css";
import Locate from "./locate.js";
import Donate from "./donate.js";
import RequestGoodsForm from "./reqdon.js";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public pages with Layout (Navbar + Footer) */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/About"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />
            <Route
              path="/Services"
              element={
                <Layout>
                  <Services />
                </Layout>
              }
            />
             <Route
              path="/Buy_And_Sale"
              element={
                <Layout>
                  <Buy_And_Sale />
                </Layout>
              }
            /> 
            <Route
              path="/Contact"
              element={
                <Layout>
                  <Contact />
                </Layout>
              }
            />
            <Route
              path="/Locate"
              element={
                <Layout>
                  <Locate/>
                </Layout>
              }
            />
            <Route
              path="/Buy"
              element={
                <Layout>
                  <Buy />
                </Layout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <Layout>
                  <ProductSingle />
                </Layout>
              }
            />
            <Route
              path="/donate"
              element={
                <Layout>
                  <Donate />
                </Layout>
              }
            />
            <Route
              path="/donation/:id"
              element={
                <Layout>
                  <DonationSingle />
                </Layout>
              }
            />
            <Route
              path="/reqdon"
              element={
                <Layout>
                  <RequestGoodsForm />
                </Layout>
              }
            />
            {/* Auth pages without Layout */}
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Dashboard pages without Layout - Protected Routes */}
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedRoute>
                  <EditProductForm />
                </ProtectedRoute>
              }
            />
            {/* Protected pages with Layout */}
            <Route
              path="/Sale"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sale />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Sale_Add_Item"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sale_Add_Item />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Add_Item_form"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Add_Item_form />
                  </Layout>
                </ProtectedRoute>
              }
            />{" "}
          </Routes>
          {/* AI Chat Component - Available on all pages */}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
