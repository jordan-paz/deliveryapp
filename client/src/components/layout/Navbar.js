import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar bg-dark">
      <h1>
        <a href="index.html">Home</a>
      </h1>
      <ul>
        <li>Shop</li>
        <li>Cart</li>
        <li>Account</li>
      </ul>
    </nav>
  );
};

export default Navbar;
