import React, { useState, useEffect } from "react";
import api from "../api/api";
import { 
  FaChartLine, 
  FaBox, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaFileDownload 
} from "react-icons/fa";

export default function Reportes() {
  const [datosReporte, setDatosReporte] = useState({
    ventasPorMes: [],
    productosMasVendidos: [],
    resumenGeneral: { totalVentas: 0, totalGanancia: 0, totalProductos: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reportes");
      
      setDatosReporte({
        ventasPorMes: res.data?.ventasPorMes || [],
        productosMasVendidos: res.data?.productosMasVendidos || [],
        resumenGeneral: res.data?.resumenGeneral || { totalVentas: 0, totalGanancia: 0, totalProductos: 0 }
      });
    } catch (error) {
      console.error("❌ Error al cargar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
      <p className="mt-3 fw-bold text-secondary">Calculando estadísticas...</p>
    </div>
  );

  return (
    <div className="container-fluid p-4 bg-light min-vh-100 pb-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center">
          <FaChartLine className="me-2 text-primary" /> Panel de Reportes
        </h2>
        <button className="btn btn-primary px-4 fw-bold shadow-sm rounded-pill" onClick={() => window.print()}>
          <FaFileDownload className="me-2"/> Exportar a PDF
        </button>
      </div>

      {/* TARJETAS DE RESUMEN GENERAL */}
      <div className="row mb-4 g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white h-100 d-flex justify-content-center">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FaMoneyBillWave className="fs-1" />
              </div>
              <div>
                <p className="mb-0 fw-semibold opacity-75">Ingresos Totales</p>
                <h2 className="fw-bold mb-0">
                  ${Number(datosReporte.resumenGeneral?.totalGanancia || 0).toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white h-100 d-flex justify-content-center">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FaCalendarAlt className="fs-1" />
              </div>
              <div>
                <p className="mb-0 fw-semibold opacity-75">Facturas Emitidas</p>
                <h2 className="fw-bold mb-0">{datosReporte.resumenGeneral?.totalVentas || 0}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-info text-white h-100 d-flex justify-content-center">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FaBox className="fs-1" />
              </div>
              <div>
                <p className="mb-0 fw-semibold opacity-75">Productos en Inventario</p>
                <h2 className="fw-bold mb-0">{datosReporte.resumenGeneral?.totalProductos || 0}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* TABLA: VENTAS POR MES */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-transparent border-bottom py-3">
              <h5 className="fw-bold mb-0 text-dark">📈 Resumen Mensual</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Mes del Año</th>
                      <th className="text-end pe-4">Monto Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReporte.ventasPorMes.length > 0 ? (
                      datosReporte.ventasPorMes.map((v, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-secondary ps-4">{v?.mes || "Desconocido"}</td>
                          <td className="text-end text-success fw-bold pe-4 fs-5">
                            ${Number(v?.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="text-center py-5 text-muted">No hay datos financieros registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA: PRODUCTOS MÁS VENDIDOS */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-transparent border-bottom py-3">
              <h5 className="fw-bold mb-0 text-dark">🏆 Top 5 Productos Más Vendidos</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Nombre del Producto</th>
                      <th className="text-center pe-4">Unidades Vendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReporte.productosMasVendidos.length > 0 ? (
                      datosReporte.productosMasVendidos.map((p, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-dark ps-4">
                            <span className="badge bg-primary rounded-circle me-2">{idx + 1}</span>
                            {p?.nombre || "Desconocido"}
                          </td>
                          <td className="text-center fw-bold text-secondary pe-4 fs-5">
                            {p?.cantidadVendido || 0}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="text-center py-5 text-muted">Aún no hay ventas de productos.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}