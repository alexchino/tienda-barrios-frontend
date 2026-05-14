import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Creamos el contexto
const ThemeContext = createContext();

// 2. Creamos el Proveedor que envolverá nuestra app
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("tema") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("tema", "dark");
    } else {
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("tema", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Este pequeño Hook nos dejará usar el tema en cualquier archivo
export const useTheme = () => useContext(ThemeContext);