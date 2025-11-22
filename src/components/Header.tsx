import React from "react";

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => (
  <header className="header">
    <div className="logo">
      <button
        className="logo-btn"
        onClick={onLogoClick}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
        aria-label="Gå til forsiden"
      >
        <img src="/FloraDanicaLogo.png" alt="Flora Danica logo" />
      </button>
    </div>
    <button className="menu-btn">
      <span></span>
      <span></span>
      <span></span>
      <span>Menu</span>
    </button>
    <div className="header-search">
      <input
        type="search"
        placeholder="Søg efter vare, kategori, mærke"
        className="search-input"
        aria-label="Søg efter vare, kategori eller mærke"
      />
      <button className="search-btn">
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>
    <div className="header-actions">
      <button className="icon-btn">
        <i className="fa-solid fa-heart"></i> Favoritter
      </button>
      <button className="icon-btn">
        <i className="fa-solid fa-user"></i> Log ind
      </button>
      <button className="icon-btn">
        <i className="fa-solid fa-cart-shopping"></i> Din kurv
      </button>
    </div>
  </header>
);

export default Header;
