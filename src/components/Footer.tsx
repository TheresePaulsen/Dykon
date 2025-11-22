import React from "react";
import "../styles/main.scss";

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="footer-content">
      <nav className="footer-nav">
        <a href="#about">Om os</a>
        <a href="#contact">Kontakt</a>
      </nav>
      <div className="footer-copyright">
        &copy; 2025 Flora Danica
      </div>
    </div>
  </footer>
);

export default Footer;
