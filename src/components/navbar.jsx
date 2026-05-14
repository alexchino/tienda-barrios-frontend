import React from "react";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  
  // Obtenemos los datos del usuario desde el localStorage
  // (Asumiendo que guardas un objeto con el nombre al hacer login)
  const user = JSON.parse(localStorage.getItem("user")) || { nombre: "Administrador" };

  // Función para poner un título bonito según la ruta
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "📊 Dashboard General";
    if (path.includes("productos")) return "📦 Gestión de Inventario";
    if (path.includes("categorias")) return "📁 Categorías de Productos";
    if (path.includes("ventas")) return "💰 Punto de Venta";
    if (path.includes("reportes")) return "📈 Reportes y Estadísticas";
    if (path.includes("usuarios")) return "👤 Control de Usuarios";
    return "Bienvenido";
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-light bg-white border-bottom"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "15px 30px",
        marginLeft: "0" // El Layout ya se encarga del margen
      }}
    >
      <div className="container-fluid">
        {/* Título dinámico basado en la ruta */}
        <span className="navbar-brand fw-bold text-secondary">
          {getTitle()}
        </span>

        <div className="d-flex align-items-center">
          {/* Fecha actual en El Salvador */}
          <div className="me-4 d-none d-md-block text-muted small">
            <i className="bi bi-calendar3 me-2"></i>
            {new Date().toLocaleDateString('es-SV', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>

          {/* Perfil de Usuario */}
          <div className="d-flex align-items-center border-start ps-4">
            <div className="text-end me-3">
              <p className="mb-0 fw-bold small text-dark">{user.nombre}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
                Online
              </p>
            </div>
            <div 
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "40px", height: "40px", fontWeight: "bold" }}
            >
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}