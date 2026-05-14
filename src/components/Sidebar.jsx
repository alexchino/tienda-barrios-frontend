import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaFileInvoiceDollar } from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openCotizaciones, setOpenCotizaciones] = useState(
    location.pathname.includes("/cotizaciones"),
  );
  // Iniciamos el submenú abierto si la ruta actual es de ventas
  const [openVentas, setOpenVentas] = useState(
    location.pathname.includes("/ventas"),
  );

  // Efecto para abrir el submenú automáticamente si navegamos a esas rutas
  useEffect(() => {
    if (location.pathname.includes("/ventas")) {
      setOpenVentas(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? "bg-primary shadow" : "";

  return (
    <div
      className="d-flex flex-column p-3 text-white"
      style={{
        width: "250px",
        height: "100vh",
        background: "#1a1a1a",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: "4px 0 10px rgba(0,0,0,0.3)",
        zIndex: 1100,
      }}
    >
      <div className="text-center mb-4 pt-2">
        <h4 className="fw-bold text-uppercase tracking-wider">
          <span className="text-primary">Tienda</span> Barrios
        </h4>
        <hr className="bg-secondary" />
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-1">
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/dashboard")}`}
            to="/dashboard"
          >
            <span className="me-2">📊</span> Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/productos")}`}
            to="/productos"
          >
            <span className="me-2">📦</span> Productos
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/categorias")}`}
            to="/categorias"
          >
            <span className="me-2">📁</span> Categorías
          </Link>
        </li>
        {/* 👇 NUEVA OPCIÓN DE PROVEEDORES AGREGADA AQUÍ 👇 */}
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/proveedores")}`}
            to="/proveedores"
          >
            <span className="me-2">🚚</span> Proveedores
          </Link>
        </li>
        {/* --- MENÚ DE VENTAS CON SUBMENÚ --- */}
        <li className="nav-item">
          <button
            className={`btn text-white w-100 text-start d-flex justify-content-between align-items-center p-2 ${location.pathname.includes("/ventas") ? "border-start border-primary border-3" : ""}`}
            onClick={() => setOpenVentas(!openVentas)}
            style={{
              borderRadius: "var(--bs-nav-pills-border-radius)",
              background: "transparent",
            }}
          >
            <span>
              <span className="me-2">💰</span> Ventas
            </span>
            <small
              style={{
                transition: "0.3s",
                transform: openVentas ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </small>
          </button>

          {openVentas && (
            <ul className="nav flex-column ms-3 mt-1 gap-1 border-start border-secondary border-opacity-25 animate__animated animate__fadeInDown">
              <li>
                <Link
                  className={`nav-link text-white small ${isActive("/ventas")}`}
                  to="/ventas"
                >
                  • Registrar Venta
                </Link>
              </li>
              <li>
                <Link
                  className={`nav-link text-white small ${isActive("/ventas-historial")}`}
                  to="/ventas-historial"
                >
                  • Ver Registro
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* --- MENÚ DE COTIZACIONES CON SUBMENÚ --- */}
        <li className="nav-item">
          <button
            className={`btn text-white w-100 text-start d-flex justify-content-between align-items-center p-2 ${location.pathname.includes("/cotizaciones") ? "border-start border-primary border-3" : ""}`}
            onClick={() => setOpenCotizaciones(!openCotizaciones)}
            style={{
              borderRadius: "var(--bs-nav-pills-border-radius)",
              background: "transparent",
            }}
          >
            <span>
              <FaFileInvoiceDollar className="me-2" /> Cotizaciones
            </span>
            <small
              style={{
                transition: "0.3s",
                transform: openCotizaciones ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </small>
          </button>

          {openCotizaciones && (
            <ul className="nav flex-column ms-3 mt-1 gap-1 border-start border-secondary border-opacity-25 animate__animated animate__fadeInDown">
              <li>
                <Link
                  className={`nav-link text-white small ${isActive("/cotizaciones")}`}
                  to="/cotizaciones"
                >
                  • Nueva Cotización
                </Link>
              </li>
              <li>
                <Link
                  className={`nav-link text-white small ${isActive("/cotizaciones/historial")}`}
                  to="/cotizaciones/historial"
                >
                  • Ver Historial
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/reportes")}`}
            to="/reportes"
          >
            <span className="me-2">📈</span> Reportes
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center ${isActive("/usuarios")}`}
            to="/usuarios"
          >
            <span className="me-2">👤</span> Usuarios
          </Link>
        </li>
      </ul>

      <div className="mt-auto pt-3 border-top border-secondary">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center"
        >
          <span className="me-2">🚪</span> Cerrar sesión
        </button>
      </div>

      {/* CSS interno para efectos de hover */}
      <style>{`
        .nav-link {
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          padding-left: 15px;
        }
        .nav-link.bg-primary:hover {
          background-color: #0b5ed7 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
