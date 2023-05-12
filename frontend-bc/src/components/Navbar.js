import { Link } from "react-router-dom";
import "./Navbar.css";
import React from "react";
import Home from "./../pages/Home";

function Navbar() {
  return (
    <nav className="NavbarItems">
      <h1 className="navbar-h1">EasyHealth</h1>
      {/* <Link to="./Home">
         <i class="fa-thin fa-heart-pulse"></i> 
        <button className="patient-button">PATIENT</button>
      </Link>

      <br />
      <a href="/">
        <button className="patient-button">LABORATORY</button>
      </a> */}
    </nav>
  );
}

export default Navbar;
