import React, { useState, useEffect } from "react";
import api from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
// ✅ Importaciones limpias: Solo dejamos los iconos que realmente usamos
import { FaSearch, FaCartPlus, FaUser, FaTrash } from "react-icons/fa";

export default function Cotizaciones() {
  const [productos, setProductos] = useState([]);

  // Estados para búsqueda
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estados del Cliente
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteCorreo, setClienteCorreo] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  // Estados de la Cotización
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // ✅ Limpieza: Ya no pedimos clientes al backend porque no se usan en esta pantalla
      const resProd = await api.get("/productos");
      setProductos(resProd.data);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
    }
  };

  const manejarBusqueda = (texto) => {
    setBusquedaProducto(texto);
    if (texto.trim() === "") {
      setProductosFiltrados([]);
      return;
    }
    const coincidencias = productos.filter((p) =>
      (p.nombre || "").toLowerCase().includes(texto.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(texto)) // Permite buscar por código de barras
    );
    setProductosFiltrados(coincidencias);
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setProductosFiltrados([]);
    setCantidad(1);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    const prodID = productoSeleccionado._id;
    const stockActual = Number(productoSeleccionado.stock || 0);

    if (stockActual < cantidad) {
      alert(`⚠️ Nota: Actualmente solo hay ${stockActual} unidades en stock. Puedes cotizar, pero considera el inventario.`);
    }

    const existente = carrito.find((p) => p.ProductID === prodID);
    if (existente) {
      setCarrito(carrito.map((p) =>
        p.ProductID === prodID ? { ...p, Cantidad: p.Cantidad + cantidad } : p
      ));
    } else {
      setCarrito([...carrito, {
        ProductID: prodID,
        Nombre: productoSeleccionado.nombre,
        Cantidad: cantidad,
        PrecioUnitario: Number(productoSeleccionado.precio)
      }]);
    }

    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
    setMensaje("✅ Añadido a la cotización");
    setTimeout(() => setMensaje(""), 1500);
  };

  const calcularSubtotal = () => carrito.reduce((acc, p) => acc + p.Cantidad * p.PrecioUnitario, 0);
  const calcularIVA = () => calcularSubtotal() * 0.13;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const guardarCotizacion = async () => {
    if (!clienteNombre.trim() || carrito.length === 0) {
      setMensaje("⚠️ Ingresa el nombre del cliente y agrega productos.");
      return;
    }

    setLoading(true);
    setMensaje("⏳ Guardando cotización...");

    try {
      const payload = {
        Nombre: clienteNombre.trim(),
        Apellido: clienteApellido.trim(),
        Correo: clienteCorreo.trim(),
        Telefono: clienteTelefono.trim(),
        productos: carrito.map((p) => ({
          ProductID: p.ProductID,
          Nombre: p.Nombre,
          Cantidad: p.Cantidad,
          PrecioUnitario: p.PrecioUnitario
        })),
        Subtotal: calcularSubtotal(),
        IVA: calcularIVA(),
        Total: calcularTotal()
      };

      await api.post("/cotizaciones", payload);
      setMensaje("📝 ¡Cotización guardada exitosamente!");

      setCarrito([]);
      setClienteNombre("");
      setClienteApellido("");
      setClienteCorreo("");
      setClienteTelefono("");
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar la cotización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100 pb-5">
      <div className="d-flex align-items-center mb-4">
        <h2 className="fw-bold mb-0">Generador de Cotizaciones</h2>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4 mb-4 rounded-4 bg-white">
            <h5 className="fw-bold mb-3"><FaSearch className="me-2 text-primary" /> Buscar Producto</h5>

            <div className="position-relative mb-3">
              <input
                type="text"
                className="form-control border-0 bg-light p-3 shadow-none"
                placeholder="Buscar por nombre o código de barras..."
                value={busquedaProducto}
                onChange={(e) => manejarBusqueda(e.target.value)}
              />
              {productosFiltrados.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                  {productosFiltrados.map((p) => (
                    <li key={p._id} className="list-group-item list-group-item-action d-flex justify-content-between cursor-pointer" onClick={() => seleccionarProducto(p)}>
                      <span className="fw-bold">{p.nombre}</span>
                      <span className="badge bg-success rounded-pill">${p.precio}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {productoSeleccionado && (
              <div className="alert alert-primary border-0 d-flex justify-content-between align-items-center animate__animated animate__fadeIn mt-2">
                <div>
                  <h6 className="mb-0 fw-bold">{productoSeleccionado.nombre}</h6>
                  <small>Precio: ${productoSeleccionado.precio}</small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <span className="fw-bold small">Cant:</span>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center fw-bold"
                    style={{ width: "65px" }}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min="1"
                  />
                  <button className="btn btn-primary btn-sm fw-bold" onClick={agregarAlCarrito}>
                    <FaCartPlus className="me-1" /> Agregar
                  </button>
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3 mt-4"><FaUser className="me-2 text-primary" /> Datos del Cliente</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Nombre *</label>
                <input className="form-control border-0 bg-light p-2" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Apellido</label>
                <input className="form-control border-0 bg-light p-2" value={clienteApellido} onChange={(e) => setClienteApellido(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Correo Electrónico</label>
                <input className="form-control border-0 bg-light p-2" value={clienteCorreo} onChange={(e) => setClienteCorreo(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Teléfono</label>
                <input className="form-control border-0 bg-light p-2" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} />
              </div>
            </div>

            {mensaje && (
              <div className={`alert mt-4 border-0 shadow-sm fw-bold ${mensaje.includes('❌') || mensaje.includes('⚠️') ? 'alert-danger text-danger' : 'alert-success text-success'}`}>
                {mensaje}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 rounded-4 h-100 d-flex flex-column bg-white">
            <h5 className="fw-bold mb-3 border-bottom pb-3">📑 Resumen de Cotización</h5>
            <div className="table-responsive flex-grow-1" style={{ minHeight: "250px" }}>
              <table className="table table-hover table-sm">
                <thead>
                  <tr className="small text-muted">
                    <th>Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-end">Subt.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 opacity-50">
                        Aún no hay productos en la cotización.
                      </td>
                    </tr>
                  ) : (
                    carrito.map((p) => (
                      <tr key={p.ProductID} className="align-middle">
                        <td className="small fw-bold">{p.Nombre}</td>
                        <td className="text-center"><span className="badge bg-light text-dark border">{p.Cantidad}</span></td>
                        <td className="text-end fw-bold text-primary">${(p.Cantidad * p.PrecioUnitario).toFixed(2)}</td>
                        <td className="text-end">
                          {/* ✅ ¡Corregido! Ahora el botón ya tiene el ícono FaTrash adentro */}
                          <button className="btn btn-sm text-danger border-0 p-0" onClick={() => setCarrito(carrito.filter(i => i.ProductID !== p.ProductID))}>
                            <FaTrash /> 
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-3 border-top">
              <div className="d-flex justify-content-between mb-1"><span>Subtotal:</span><span>${calcularSubtotal().toFixed(2)}</span></div>
              <div className="d-flex justify-content-between mb-1"><span>IVA (13%):</span><span>${calcularIVA().toFixed(2)}</span></div>
              <div className="d-flex justify-content-between fs-2 fw-bold text-success mb-4"><span>TOTAL:</span><span>${calcularTotal().toFixed(2)}</span></div>

              <button
                className="btn btn-success btn-lg w-100 mt-4 shadow fw-bold py-3 rounded-pill"
                onClick={guardarCotizacion}
                disabled={carrito.length === 0 || loading}
              >
                {loading ? "⏳ GUARDANDO..." : "📝 GUARDAR COTIZACIÓN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}