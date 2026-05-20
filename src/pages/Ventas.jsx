import React, { useState, useEffect } from "react";
import api from "../api/api"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/ThemeContext";
import TicketVenta from "../components/TicketVenta";
import { 
  FaSearch, FaCartPlus, FaCashRegister, FaUser, FaTrash, 
  FaIdCard, FaPhoneAlt, FaFileAlt, FaReceipt, FaBarcode 
} from "react-icons/fa"; 
import { useLocation } from "react-router-dom";

export default function Ventas() {
  const location = useLocation();
  const [cotizacionOrigenId, setCotizacionOrigenId] = useState(null);
  const { darkMode } = useTheme();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  // Búsqueda y Selección
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [codigoEscaneado, setCodigoEscaneado] = useState(""); 
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  // Datos del Cliente y Comprobante
  const [tipoDocumento, setTipoDocumento] = useState("ticket"); 
  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    dui: ""
  });
  
  // Carrito y Estado de Transacción
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [ticket, setTicket] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ NUEVO: Estados para el efectivo y el vuelto
  const [efectivoRecibido, setEfectivoRecibido] = useState("");

  useEffect(() => {
    cargarDatos();
    
    // Si venimos del Historial de Cotizaciones, auto-llenamos todo
    if (location.state && location.state.cotizacion) {
      const cot = location.state.cotizacion;
      setCotizacionOrigenId(cot._id); 
      
      setCliente({
        nombre: cot.Nombre || "",
        apellido: cot.Apellido || "",
        correo: cot.Correo || "",
        telefono: cot.Telefono || "",
        dui: "" 
      });
      
      setCarrito(cot.productos || []);
      setMensaje("✅ Cotización cargada lista para facturar");
      setTimeout(() => setMensaje(""), 3000);
    }
  }, [location.state]);

  const cargarDatos = async () => {
    try {
      const [resProd, resClie] = await Promise.all([
        api.get("/productos"),
        api.get("/clientes")
      ]);
      setProductos(resProd.data);
      setClientes(resClie.data);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
    }
  };

  const manejarBusqueda = (texto) => {
    setBusquedaProducto(texto);
    if (!texto.trim()) return setProductosFiltrados([]);
    const coincidencias = productos.filter((p) =>
      p.nombre.toLowerCase().includes(texto.toLowerCase()) || 
      (p.codigo_barras && p.codigo_barras.includes(texto)) 
    );
    setProductosFiltrados(coincidencias);
  };

  const manejarEscaneo = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (!codigoEscaneado.trim()) return;

      const productoEncontrado = productos.find(p => p.codigo_barras === codigoEscaneado.trim());

      if (productoEncontrado) {
        const stockActual = Number(productoEncontrado.stock || 0);
        const prodID = productoEncontrado._id;

        if (stockActual < 1) {
          setMensaje(`❌ Stock insuficiente para: ${productoEncontrado.nombre}`);
          setTimeout(() => setMensaje(""), 3000);
        } else {
          const existente = carrito.find((p) => p.ProductID === prodID);
          
          if (existente && existente.Cantidad + 1 > stockActual) {
            setMensaje("❌ No puedes superar el stock disponible.");
            setTimeout(() => setMensaje(""), 3000);
          } else if (existente) {
            setCarrito(carrito.map((p) => 
              p.ProductID === prodID ? { ...p, Cantidad: p.Cantidad + 1 } : p
            ));
            setMensaje(`✅ ${productoEncontrado.nombre} añadido`);
            setTimeout(() => setMensaje(""), 1500);
          } else {
            setCarrito([...carrito, {
              ProductID: prodID,
              Nombre: productoEncontrado.nombre,
              Cantidad: 1,
              PrecioUnitario: Number(productoEncontrado.precio)
            }]);
            setMensaje(`✅ ${productoEncontrado.nombre} añadido`);
            setTimeout(() => setMensaje(""), 1500);
          }
        }
      } else {
        setMensaje(`❌ Código ${codigoEscaneado} no registrado`);
        setTimeout(() => setMensaje(""), 3000);
      }
      setCodigoEscaneado(""); 
    }
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setProductosFiltrados([]); 
    setCantidad(1);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    const stockActual = Number(productoSeleccionado.stock || 0);
    const prodID = productoSeleccionado._id; 

    if (stockActual < cantidad) {
      setMensaje(`❌ Stock insuficiente. Solo hay ${stockActual} unidades.`);
      return setTimeout(() => setMensaje(""), 3000);
    }

    const existente = carrito.find((p) => p.ProductID === prodID);
    if (existente && existente.Cantidad + cantidad > stockActual) {
      setMensaje("❌ No puedes superar el stock disponible.");
      return setTimeout(() => setMensaje(""), 3000);
    }

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
    setMensaje("✅ Producto añadido");
    setTimeout(() => setMensaje(""), 1500);
  };

  // ✅ NUEVO: Función de total calculando solo el neto sin IVA
  const calcularTotal = () => {
    return carrito.reduce((acc, p) => acc + p.Cantidad * p.PrecioUnitario, 0);
  };

  const realizarVenta = async () => {
    if (!cliente.nombre.trim() || !cliente.apellido.trim() || carrito.length === 0) {
      return setMensaje("⚠️ Por favor, completa los datos del cliente y el carrito.");
    }

    if (tipoDocumento === "factura" && !cliente.dui.trim()) {
      return setMensaje("⚠️ El DUI/NIT es obligatorio para emitir facturas.");
    }

    const total = calcularTotal();
    const efectivo = Number(efectivoRecibido);

    // ✅ Validación: El cliente debe dar suficiente dinero
    if (efectivo < total) {
      return setMensaje("⚠️ El efectivo recibido es menor al total de la compra.");
    }

    setLoading(true);

    try {
      const payload = {
        Nombre: cliente.nombre.trim(),
        Apellido: cliente.apellido.trim(),
        Correo: cliente.correo.trim(),
        Telefono: cliente.telefono.trim(),
        DUI: cliente.dui.trim(),
        tipoDocumento, 
        productos: carrito.map(p => ({ ProductID: p.ProductID, Cantidad: p.Cantidad })),
        metodoPago: "efectivo"
      };

      const res = await api.post("/ventas/registrar", payload);

      if (cotizacionOrigenId) {
        await api.put(`/cotizaciones/${cotizacionOrigenId}`, { estado: 'Pagado' });
      }

      // ✅ Enviamos Efectivo y Vuelto al Ticket
      setTicket({
        _id: res.data.VentaID,
        NumeroSecuencia: res.data.NumeroTicket || Math.floor(Math.random() * 10000), 
        Total: total,
        Efectivo: efectivo,
        Vuelto: efectivo - total,
        Fecha: new Date(),
        NombreCliente: `${cliente.nombre} ${cliente.apellido}`,
        DUICliente: cliente.dui,
        TipoDocumento: tipoDocumento, 
        productos: carrito 
      });

      // Resetear formulario
      setCarrito([]);
      setCliente({ nombre: "", apellido: "", correo: "", telefono: "", dui: "" });
      setTipoDocumento("ticket");
      setCotizacionOrigenId(null);
      setEfectivoRecibido(""); // Limpiar caja de efectivo
      cargarDatos();
      setMensaje(`✅ Venta procesada con éxito. Cambio: $${(efectivo - total).toFixed(2)}`);
      
    } catch (err) {
      setMensaje(`❌ Error: ${err.response?.data?.mensaje || "Fallo en la red"}`);
    } finally {
      setLoading(false);
    }
  };

  const total = calcularTotal();
  const vuelto = efectivoRecibido ? (Number(efectivoRecibido) - total) : 0;

  return (
    <div className={`container-fluid p-4 ${darkMode ? 'bg-dark text-white' : 'bg-light'} min-vh-100 pb-5`}>
      <div className="d-flex align-items-center mb-4">
        <FaCashRegister className="fs-2 text-primary me-3" />
        <h2 className="fw-bold mb-0">Caja Registradora - Tienda Barrios</h2>
      </div>

      <div className="row g-4">
        {/* PANEL DE OPERACIÓN */}
        <div className="col-lg-7">
          <div className={`card shadow-sm border-0 p-4 mb-4 rounded-4 ${darkMode ? 'bg-secondary text-white' : 'bg-white'}`}>
            <h5 className="fw-bold mb-3"><FaSearch className="me-2 text-primary" /> Selección de Productos</h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-success text-white border-success">
                    <FaBarcode />
                  </span>
                  <input
                    type="text"
                    className="form-control border-success p-3 shadow-none bg-light"
                    placeholder="Pistola escáner..."
                    value={codigoEscaneado}
                    onChange={(e) => setCodigoEscaneado(e.target.value)}
                    onKeyDown={manejarEscaneo}
                    autoFocus 
                  />
                </div>
              </div>

              <div className="col-md-6 position-relative">
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light p-3 shadow-none"
                    placeholder="Búsqueda manual..."
                    value={busquedaProducto}
                    onChange={(e) => manejarBusqueda(e.target.value)}
                  />
                </div>
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
            </div>

            {productoSeleccionado && (
              <div className="alert alert-primary border-0 d-flex justify-content-between align-items-center animate__animated animate__fadeIn mt-2">
                <div>
                  <h6 className="mb-0 fw-bold">{productoSeleccionado.nombre}</h6>
                  <small>Precio: ${productoSeleccionado.precio} | Stock: {productoSeleccionado.stock}</small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <input type="number" className="form-control form-control-sm text-center" style={{ width: "60px" }} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} min="1" />
                  <button className="btn btn-primary btn-sm fw-bold" onClick={agregarAlCarrito}><FaCartPlus /> Añadir</button>
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3 mt-4"><FaUser className="me-2 text-primary" /> Detalles de Facturación</h5>
            
            <div className={`d-flex gap-3 mb-4 p-3 rounded-3 shadow-sm ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
              <span className="fw-bold small text-muted">DOCUMENTO:</span>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="tipoDoc" id="t" checked={tipoDocumento === "ticket"} onChange={() => setTipoDocumento("ticket")} />
                <label className="form-check-label fw-bold" htmlFor="t"><FaReceipt /> Ticket</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="tipoDoc" id="f" checked={tipoDocumento === "factura"} onChange={() => setTipoDocumento("factura")} />
                <label className="form-check-label fw-bold" htmlFor="f"><FaFileAlt /> Factura</label>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Nombre *</label>
                <input className={`form-control border-0 p-2 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`} value={cliente.nombre} onChange={(e) => setCliente({...cliente, nombre: e.target.value})} required/>
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Apellido *</label>
                <input className={`form-control border-0 p-2 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`} value={cliente.apellido} onChange={(e) => setCliente({...cliente, apellido: e.target.value})} required/>
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">DUI/NIT {tipoDocumento === 'factura' && <span className="text-danger">*</span>}</label>
                <div className="input-group">
                  <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-muted' : 'bg-light'}`}><FaIdCard /></span>
                  <input className={`form-control border-0 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`} placeholder="00000000-0" value={cliente.dui} onChange={(e) => setCliente({...cliente, dui: e.target.value})} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">Teléfono</label>
                <div className="input-group">
                  <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-muted' : 'bg-light'}`}><FaPhoneAlt /></span>
                  <input className={`form-control border-0 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`} value={cliente.telefono} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} />
                </div>
              </div>
            </div>
            {mensaje && <div className={`alert mt-4 fw-bold border-0 shadow-sm ${mensaje.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{mensaje}</div>}
          </div>
        </div>

        {/* PANEL DE COBRO (CARRITO) */}
        <div className="col-lg-5">
          <div className={`card shadow-sm border-0 p-4 rounded-4 h-100 d-flex flex-column ${darkMode ? 'bg-secondary text-white' : 'bg-white'}`}>
            <h5 className="fw-bold mb-3 border-bottom pb-3">🛒 Resumen de Compra</h5>
            <div className="table-responsive flex-grow-1" style={{ minHeight: "220px" }}>
              <table className={`table table-hover table-sm ${darkMode ? 'table-dark' : ''}`}>
                <thead>
                  <tr className="small text-muted">
                    <th>DESCRIPCIÓN</th>
                    <th className="text-center">CANT.</th>
                    <th className="text-end">SUBTOTAL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-5 opacity-50">Selecciona productos para comenzar</td></tr>
                  ) : (
                    carrito.map((p) => (
                      <tr key={p.ProductID} className="align-middle">
                        <td className="small fw-bold">{p.Nombre}</td>
                        <td className="text-center"><span className="badge bg-light text-dark border">{p.Cantidad}</span></td>
                        <td className="text-end fw-bold text-primary">${(p.Cantidad * p.PrecioUnitario).toFixed(2)}</td>
                        <td className="text-end"><button className="btn btn-link text-danger p-0" onClick={() => setCarrito(carrito.filter(i => i.ProductID !== p.ProductID))}><FaTrash /></button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-3 border-top">
              {/* ✅ TOTAL GIGANTE SIN IVA */}
              <div className="d-flex justify-content-between fs-2 fw-bold text-success mb-3">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {/* ✅ NUEVO: SECCIÓN DE EFECTIVO Y VUELTO */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="small fw-bold text-muted">Efectivo Recibido</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">$</span>
                    <input 
                      type="number" 
                      className="form-control fw-bold text-primary" 
                      placeholder="0.00" 
                      value={efectivoRecibido} 
                      onChange={(e) => setEfectivoRecibido(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted">Vuelto a entregar</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">$</span>
                    <input 
                      type="text" 
                      className={`form-control fw-bold ${vuelto >= 0 && efectivoRecibido !== "" ? 'text-success' : 'text-danger'}`} 
                      value={efectivoRecibido !== "" ? vuelto.toFixed(2) : "0.00"} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>

              {/* Botón protegido si no dan suficiente dinero */}
              <button 
                className="btn btn-success btn-lg w-100 py-3 rounded-pill fw-bold shadow" 
                onClick={realizarVenta} 
                disabled={carrito.length === 0 || loading || (efectivoRecibido === "") || vuelto < 0}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCashRegister className="me-2" />}
                PROCESAR PAGO E IMPRIMIR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE TICKET/FACTURA */}
      {ticket && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 bg-transparent shadow-lg">
               <TicketVenta ticket={ticket} setTicket={setTicket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}