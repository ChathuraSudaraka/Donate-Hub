import React from "react";
import Navigation_bar from "../Navigation_bar";
import "./Layout.css";
import Footers from "./Footer";
import AIChat from "./AIChat";

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navigation_bar />
      <main className="main-content">{children}</main>
      <AIChat />
      <Footers />
    </div>
  );
};

export default Layout;
