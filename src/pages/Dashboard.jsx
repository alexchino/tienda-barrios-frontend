import React, { useState, useEffect } from "react";
import api from "../api/api";
import {
  FaBox,
  FaFolderOpen,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaPlus,
  FaClipboardList,
} from "react-icons/fa";
import DarkModeToggle from "../components/DarkModeToggle";
import { useTheme } from "../context/ThemeContext"; // ✅ IMPORTANTE: Importar el hook

export default function Dashboard() {
  const { darkMode } = useTheme(); // ✅ IMPORTANTE: Conectar con el estado global
  
  const [resumen, setResumen] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    facturasHoy: 0,
    ventasHoy: 0,
  });

  const [cargando, setCargando] = useState(true);
  const nombreUsuario = localStorage.getItem("nombre") || "Administrador";

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const obtenerEstadisticas = async () => {
    try {
      setCargando(true);
      const [resProd, resCat, resVentas] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias"),
        api.get("/ventas"),
      ]);

      const fechaHoy = new Date().toLocaleDateString();
      const ventasDeHoy = (resVentas.data || []).filter((v) => {
        return new Date(v.createdAt).toLocaleDateString() === fechaHoy;
      });

      const dineroHoy = ventasDeHoy.reduce(
        (suma, venta) => suma + (Number(venta.total) || 0),
        0,
      );

      setResumen({
        totalProductos: resProd.data?.length || 0,
        totalCategorias: resCat.data?.length || 0,
        facturasHoy: ventasDeHoy.length,
        ventasHoy: dineroHoy,
      });
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className={`container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        <p className={`mt-3 fw-bold ${darkMode ? 'text-white' : 'text-secondary'}`}>
          Cargando tu panel de control...
        </p>
      </div>
    );
  }

  return (
    // ✅ Cambiamos bg-light fijo por el color del tema
    <div className={`container-fluid p-4 min-vh-100 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className={`fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>Panel de Control</h2>
          <p className={`${darkMode ? 'text-light' : 'text-muted'} fs-5`}>
            ¡Hola de nuevo, <span className="fw-bold text-primary">{nombreUsuario}</span>! Este es el resumen de tu negocio hoy.
          </p>
        </div>
        {/* ✅ Botón de Modo Oscuro a la derecha */}
        <DarkModeToggle />
      </div>

      {/* 📊 TARJETAS DE MÉTRICAS */}
      <div className="row g-4">
        {/* Productos */}
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm p-3 h-100 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border border-secondary' : 'bg-white text-dark'}`} style={{ borderLeft: "5px solid #0d6efd", borderRadius: "12px" }}>
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary fs-4">
                <FaBox />
              </div>
              <div>
                <h6 className={`${darkMode ? 'text-info' : 'text-muted'} mb-1 small text-uppercase fw-bold`}>Productos</h6>
                <h3 className="fw-bold mb-0">{resumen.totalProductos}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm p-3 h-100 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border border-secondary' : 'bg-white text-dark'}`} style={{ borderLeft: "5px solid #198754", borderRadius: "12px" }}>
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3 text-success fs-4">
                <FaFolderOpen />
              </div>
              <div>
                <h6 className={`${darkMode ? 'text-info' : 'text-muted'} mb-1 small text-uppercase fw-bold`}>Categorías</h6>
                <h3 className="fw-bold mb-0">{resumen.totalCategorias}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Facturas Hoy */}
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm p-3 h-100 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border border-secondary' : 'bg-white text-dark'}`} style={{ borderLeft: "5px solid #ffc107", borderRadius: "12px" }}>
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3 text-warning fs-4">
                <FaFileInvoiceDollar />
              </div>
              <div>
                <h6 className={`${darkMode ? 'text-info' : 'text-muted'} mb-1 small text-uppercase fw-bold`}>Facturas Hoy</h6>
                <h3 className="fw-bold mb-0">{resumen.facturasHoy}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos Hoy */}
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm p-3 h-100 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border border-secondary' : 'bg-white text-dark'}`} style={{ borderLeft: "5px solid #dc3545", borderRadius: "12px" }}>
            <div className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3 text-danger fs-4">
                <FaMoneyBillWave />
              </div>
              <div>
                <h6 className={`${darkMode ? 'text-info' : 'text-muted'} mb-1 small text-uppercase fw-bold`}>Ingresos Hoy</h6>
                <h3 className="fw-bold mb-0">${resumen.ventasHoy.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ ACCIONES RÁPIDAS */}
      <div className="row mt-5">
        <div className="col-md-12">
          <div className={`card border-0 shadow-sm p-4 ${darkMode ? 'bg-secondary bg-opacity-10 text-white border border-secondary' : 'bg-white text-dark'}`} style={{ borderRadius: "15px" }}>
            <h5 className="fw-bold mb-4">⚡ Acciones Rápidas</h5>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-primary px-4 py-2 shadow-sm fw-bold d-flex align-items-center rounded-pill" onClick={() => (window.location.href = "/ventas")}>
                <FaPlus className="me-2" /> Nueva Venta
              </button>
              <button className={`btn px-4 py-2 fw-bold d-flex align-items-center rounded-pill ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`} onClick={() => (window.location.href = "/productos")}>
                <FaClipboardList className="me-2" /> Gestionar Inventario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}