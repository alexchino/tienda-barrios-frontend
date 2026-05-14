import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function DarkModeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`btn rounded-pill px-3 shadow-sm d-flex align-items-center fw-bold ${darkMode ? 'btn-light text-dark' : 'btn-dark text-white'}`}
      onClick={toggleTheme}
    >
      {darkMode ? (
        <><FaSun className="me-2 text-warning" /> Modo Claro</>
      ) : (
        <><FaMoon className="me-2 text-info" /> Modo Oscuro</>
      )}
    </button>
  );
}