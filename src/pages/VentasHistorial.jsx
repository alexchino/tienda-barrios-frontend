import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "../components/Pagination";
import { FaHistory, FaSync, FaFileInvoiceDollar, FaEye, FaUser, FaBox, FaIdCard, FaPhoneAlt } from "react-icons/fa";

export default function VentasHistorial() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para el modal de detalle
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ventas"); 
      setVentas(res.data || []);
    } catch (error) {
      console.error("❌ Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Paginación
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const ventasMostradas = ventas.slice(indexFirst, indexLast);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 fw-bold text-secondary">Cargando historial de ventas...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark mb-0">
          <FaHistory className="me-2 text-primary" /> Historial de Ventas
        </h3>
        <button className="btn btn-primary shadow-sm d-flex align-items-center rounded-pill" onClick={cargarHistorial}>
          <FaSync className="me-2" /> Actualizar Datos
        </button>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden rounded-4 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr className="text-center">
                <th className="py-3">Factura #</th>
                <th className="py-3">Fecha</th>
                <th className="py-3 text-start ps-4">Cliente</th>
                <th className="py-3">Total</th>
                <th className="py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasMostradas.length > 0 ? (
                ventasMostradas.map((v) => (
                  <tr key={v._id} className="text-center border-bottom">
                    <td className="fw-bold text-primary">
                      #{v.numeroTicket || v._id?.slice(-6).toUpperCase() || "S/N"}
                    </td>
                    <td className="text-muted small">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="text-start ps-4 fw-semibold">
                      <FaUser className="me-2 text-muted small" />
                      {/* ✅ Muestra Nombre y Apellido directamente de la venta */}
                      {v.nombre_cliente ? `${v.nombre_cliente} ${v.apellido_cliente || ""}` : "Consumidor Final"}
                    </td>
                    <td className="fw-bold text-success">
                      ${Number(v.total || 0).toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold"
                        onClick={() => setVentaSeleccionada(v)}
                      >
                        <FaEye className="me-1" /> Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-5 text-center text-muted">
                    No se encontraron ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ MODAL DE DETALLE DE VENTA CON DATOS DEL CLIENTE INTEGRADOS */}
      {ventaSeleccionada && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              
              <div className="modal-header bg-primary text-white border-0 p-4">
                <h5 className="modal-title fw-bold">
                  <FaFileInvoiceDollar className="me-2" /> 
                  Detalle de Venta #{ventaSeleccionada.numeroTicket || ventaSeleccionada._id?.slice(-6).toUpperCase()}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setVentaSeleccionada(null)}></button>
              </div>
              
              <div className="modal-body p-4 bg-light">
                
                {/* 💳 TARJETA DEL CLIENTE */}
                <div className="card border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-body">
                    <h6 className="text-primary small text-uppercase fw-bold mb-3 border-bottom pb-2">
                      <FaUser className="me-2"/> Información del Cliente
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Nombre Completo:</span>
                        <span className="fw-bold fs-6">
                          {ventaSeleccionada.nombre_cliente ? `${ventaSeleccionada.nombre_cliente} ${ventaSeleccionada.apellido_cliente || ""}` : "Consumidor Final"}
                        </span>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Fecha de Emisión:</span>
                        <span className="fw-semibold text-dark">{new Date(ventaSeleccionada.createdAt).toLocaleString()}</span>
                      </div>
                      {/* Datos extra de facturación salvadoreña */}
                      <div className="col-md-6">
                        <span className="text-muted small d-block">Documento (DUI/NIT):</span>
                        <span className="fw-semibold text-dark">
                          {ventaSeleccionada.dui_cliente ? <><FaIdCard className="me-1 text-muted"/> {ventaSeleccionada.dui_cliente}</> : "No proporcionado"}
                        </span>
                      </div>
                      <div className="col-md-6">
                        <span className="text-muted small d-block">Teléfono:</span>
                        <span className="fw-semibold text-dark">
                          {ventaSeleccionada.telefono_cliente ? <><FaPhoneAlt className="me-1 text-muted"/> {ventaSeleccionada.telefono_cliente}</> : "No proporcionado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="text-muted small text-uppercase fw-bold mb-3">Productos Vendidos</h6>
                <div className="table-responsive bg-white rounded-3 shadow-sm p-2 mb-4">
                  <table className="table table-borderless table-hover align-middle mb-0">
                    <thead className="border-bottom bg-light">
                      <tr>
                        <th className="text-muted small">Producto</th>
                        <th className="text-center text-muted small">Cant.</th>
                        <th className="text-end text-muted small">Precio Unit.</th>
                        <th className="text-end text-muted small">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ventaSeleccionada.productos || []).map((p, index) => (
                        <tr key={index} className="border-bottom">
                          <td className="fw-semibold text-dark">
                            <FaBox className="me-2 text-primary small" />
                            {p.nombre || p.Nombre}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border">{p.cantidad || p.Cantidad}</span>
                          </td>
                          <td className="text-end text-muted">${Number(p.precio || 0).toFixed(2)}</td>
                          <td className="text-end fw-bold text-dark">${Number(p.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TOTALES */}
                <div className="row justify-content-end">
                  <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted fw-semibold">Subtotal:</span>
                          <span className="text-dark">${Number(ventaSeleccionada.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted fw-semibold">IVA (13%):</span>
                          <span className="text-dark">${Number(ventaSeleccionada.iva || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-3 mt-2 fw-bold fs-4 text-success">
                          <span>TOTAL:</span>
                          <span>${Number(ventaSeleccionada.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-0 p-4 rounded-bottom-4">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setVentaSeleccionada(null)}>Cerrar</button>
                <button className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" onClick={() => window.print()}>
                  🖨️ Imprimir Factura
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 📄 CONTROLES DE PAGINACIÓN */}
      {ventas.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            totalItems={ventas.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}