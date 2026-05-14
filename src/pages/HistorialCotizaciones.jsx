import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaFilePdf,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
} from "react-icons/fa";

const HistorialCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const navigate = useNavigate();

  // Sacamos la función del useEffect para poder reutilizarla al actualizar la tabla
  const cargarCotizaciones = async () => {
    try {
      const res = await api.get("/cotizaciones");
      setCotizaciones(res.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  // 🗑️ FUNCIÓN PARA ELIMINAR
  const eliminarCotizacion = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar esta cotización permanentemente?",
      )
    ) {
      try {
        await api.delete(`/cotizaciones/${id}`);
        cargarCotizaciones(); // Recargar la tabla
        alert("🗑️ Cotización eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al eliminar la cotización.");
      }
    }
  };

  // 💰 FUNCIÓN PARA PAGAR
  const pagarCotizacion = async (id) => {
    if (window.confirm("¿Confirmas que el cliente ya pagó esta cotización?")) {
      try {
        // Enviamos la actualización al backend para cambiar el estado
        await api.put(`/cotizaciones/${id}`, { estado: "Pagado" });
        cargarCotizaciones(); // Recargar la tabla
        alert("✅ ¡Cotización pagada con éxito!");
      } catch (error) {
        console.error("Error al registrar el pago:", error);
        alert("Hubo un error al registrar el pago.");
      }
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
    >
      <h2 className="fw-bold mb-4">Historial de Cotizaciones</h2>
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="px-4">Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No hay cotizaciones registradas.
                  </td>
                </tr>
              ) : (
                cotizaciones.map((c) => {
                  // Variable para saber si ya está pagada
                  const esPagado = c.estado === "Pagado";

                  return (
                    <tr key={c._id}>
                      <td className="px-4 text-muted small">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="fw-bold">
                        {c.Nombre} {c.Apellido || ""}
                      </td>
                      <td className="text-primary fw-bold">
                        ${(c.Total || 0).toFixed(2)}
                      </td>
                      <td>
                        {/* 🏷️ ETIQUETA DINÁMICA: Cambia de color según el estado */}
                        <span
                          className={`badge ${esPagado ? "bg-success" : "bg-warning text-dark"}`}
                        >
                          {c.estado || "Pendiente"}
                        </span>
                      </td>
                      <td className="text-center px-4">
                        {/* 💰 BOTÓN PAGAR: Te lleva a Ventas con los datos de la cotización */}
                        {!esPagado && (
                          <button
                            className="btn btn-sm btn-success me-1 fw-bold shadow-sm"
                            title="Procesar como Venta"
                            onClick={() =>
                              navigate("/ventas", { state: { cotizacion: c } })
                            }
                          >
                            <FaMoneyBillWave className="me-1" /> Pagar
                          </button>
                        )}

                        {/* ✏️ BOTÓN EDITAR: Solo se muestra si NO está pagado */}
                        {!esPagado && (
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            title="Editar Cotización"
                            onClick={() =>
                              navigate(`/cotizaciones/editar/${c._id}`)
                            }
                          >
                            <FaEdit />
                          </button>
                        )}

                        {/* BOTONES PERMANENTES  PDF*/}
                       
                        <button
                          className="btn btn-sm btn-outline-danger me-1"
                          title="Descargar PDF"
                        >
                          <FaFilePdf />
                        </button>

                        {/* 🗑️ BOTÓN ELIMINAR */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Eliminar"
                          onClick={() => eliminarCotizacion(c._id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialCotizaciones;
