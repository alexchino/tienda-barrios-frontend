import React from "react";
import Sidebar from "./Sidebar";
import { useTheme } from "../context/ThemeContext"; 

export default function Layout({ children }) {
  const { darkMode } = useTheme(); 

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      // ✅ El contenedor padre también debe cambiar para evitar bordes blancos
      backgroundColor: darkMode ? "#121212" : "#f4f7f6" 
    }}>
      {/* Barra lateral fija */}
      <Sidebar />

      {/* Área de contenido principal */}
      <main
        style={{
          marginLeft: "250px", 
          padding: "30px",
          width: "calc(100% - 250px)",
          // ✅ FONDO DINÁMICO: Si es oscuro usa un gris casi negro, si no, el gris suave
          background: darkMode ? "#121212" : "#f4f7f6", 
          // ✅ COLOR DE TEXTO DINÁMICO: Para que las letras se vean blancas en modo oscuro
          color: darkMode ? "#ffffff" : "#212529",
          transition: "background 0.3s ease, color 0.3s ease", // Animación suave
        }}
      >
        {/* Contenedor centrado */}
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}