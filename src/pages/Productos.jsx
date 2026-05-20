import React, { useState, useEffect } from "react";
import api from "../api/api"; 
import Pagination from "../components/Pagination"; 
// ✅ CÓDIGO DE BARRAS: Agregamos FaBarcode a las importaciones
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImage, FaBoxOpen, FaTruck, FaBarcode } from "react-icons/fa";

const API_URL = "https://tienda-barrios-backend.onrender.com"; // Asegúrate de que esta URL sea correcta para acceder a las imágenes

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]); 
  
  const [productoActual, setProductoActual] = useState({
    _id: "",
    nombre: "",
    codigo_barras: "", // ✅ CÓDIGO DE BARRAS: Nuevo campo en el estado inicial
    descripcion: "",
    precio: "",
    stock: "",
    categoria_id: "", 
    proveedor_id: "", 
    imagen: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [imagenModal, setImagenModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProd, resCat, resProv] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias"),
        api.get("/proveedores") 
      ]);
      setProductos(resProd.data || []);
      setCategorias(resCat.data || []);
      setProveedores(resProv.data || []); 
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductoActual({ ...productoActual, [name]: value });
  };

  const handleFileChange = (e) => {
    setProductoActual({ ...productoActual, imagen: e.target.files[0] });
  };

  const abrirModalAgregar = () => {
    setProductoActual({
      _id: "",
      nombre: "",
      codigo_barras: "", // ✅ CÓDIGO DE BARRAS: Limpiamos al abrir modal
      descripcion: "",
      precio: "",
      stock: "",
      categoria_id: "", 
      proveedor_id: "", 
      imagen: null,
    });
    setModoEdicion(false);
    setShowModal(true);
  };

  const abrirModalEditar = (p) => {
    setProductoActual({
      _id: p._id,
      nombre: p.nombre || "",
      codigo_barras: p.codigo_barras || "", // ✅ CÓDIGO DE BARRAS: Cargamos el código si existe
      descripcion: p.descripcion || "",
      precio: p.precio || "",
      stock: p.stock || "",
      categoria_id: p.categoria_id?._id || p.categoria_id || "",
      proveedor_id: p.proveedor_id?._id || p.proveedor_id || "", 
      imagen: null,
    });
    setModoEdicion(true);
    setShowModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!productoActual.categoria_id || productoActual.categoria_id.length < 20) {
      return alert("⚠️ Por favor, selecciona una categoría.");
    }
    
    if (!productoActual.proveedor_id || productoActual.proveedor_id.length < 20) {
      return alert("⚠️ Por favor, selecciona un proveedor.");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("nombre", productoActual.nombre);
    // ✅ CÓDIGO DE BARRAS: Lo enviamos al backend (puede ir vacío ya que no es obligatorio)
    formData.append("codigo_barras", productoActual.codigo_barras || ""); 
    formData.append("descripcion", productoActual.descripcion || "");
    formData.append("precio", productoActual.precio);
    formData.append("stock", productoActual.stock);
    formData.append("categoria_id", productoActual.categoria_id); 
    formData.append("proveedor_id", productoActual.proveedor_id); 

    if (productoActual.imagen) {
      formData.append("imagen", productoActual.imagen);
    }

    try {
      if (modoEdicion) {
        await api.put(`/productos/${productoActual._id}`, formData);
      } else {
        await api.post("/productos", formData);
      }

      setShowModal(false);
      await cargarDatos(); 
      alert("✨ ¡Producto guardado con éxito!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detalle || error.response?.data?.mensaje || "Error en el servidor";
      alert("❌ " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Deseas eliminar este producto permanentemente?")) {
      try {
        await api.delete(`/productos/${id}`);
        cargarDatos();
      } catch (error) {
        console.error("❌ Error al eliminar:", error);
      }
    }
  };

  const productosFiltrados = productos.filter((p) =>
    (p.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (p.codigo_barras || "").includes(busqueda) // ✅ CÓDIGO DE BARRAS: También permite buscar por código en la tabla
  );

  const inicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(inicio, inicio + productosPorPagina);

  return (
    <div className="container-fluid py-4 px-4 pb-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center">
          <FaBoxOpen className="text-primary me-2" /> Productos
        </h2>
        <button className="btn btn-primary px-4 fw-bold shadow-sm rounded-pill" onClick={abrirModalAgregar}>
          <FaPlus className="me-2" /> Nuevo Producto
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body d-flex align-items-center bg-light rounded-4">
          <FaSearch className="text-muted ms-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            className="form-control border-0 bg-transparent fs-5 shadow-none"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="table-responsive shadow-sm rounded-4 overflow-hidden bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark text-center">
            <tr>
              <th>Imagen</th>
              <th>Código</th> {/* ✅ CÓDIGO DE BARRAS: Nueva columna */}
              <th>Producto</th>
              <th>Categoría</th>
              <th>Proveedor</th> 
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {productosPaginados.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productosPaginados.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.imagen ? (
                      <img 
                        src={`${API_URL}/uploads/${p.imagen}`} 
                        alt={p.nombre} 
                        className="rounded shadow-sm" 
                        style={{ width: "45px", height: "45px", objectFit: "cover", cursor: "zoom-in" }} 
                        onClick={() => setImagenModal(p.imagen)} 
                      />
                    ) : <FaImage className="text-muted fs-4" />}
                  </td>
                  {/* ✅ CÓDIGO DE BARRAS: Mostramos el código con un diseño limpio */}
                  <td>
                    {p.codigo_barras ? (
                       <span className="badge bg-light text-dark border">
                         <FaBarcode className="me-1" /> {p.codigo_barras}
                       </span>
                    ) : (
                       <span className="text-muted small">N/A</span>
                    )}
                  </td>
                  <td className="fw-bold">{p.nombre}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {p.categoria_id?.nombre || "Sin Categoría"}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary text-white">
                      <FaTruck className="me-1" /> {p.proveedor_id?.nombreEmpresa || "Sin Proveedor"}
                    </span>
                  </td>
                  <td className="text-primary fw-bold">${parseFloat(p.precio || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.stock <= 5 ? "bg-danger" : "bg-success"}`}>
                      {p.stock} unid.
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-warning border-0 me-1" onClick={() => abrirModalEditar(p)}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarProducto(p._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {productosFiltrados.length > 0 && (
        <Pagination 
          totalItems={productosFiltrados.length} 
          itemsPerPage={productosPorPagina} 
          currentPage={paginaActual} 
          onPageChange={setPaginaActual} 
        />
      )}

      {/* MODAL FORMULARIO */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-primary text-white border-0 p-4">
                <h5 className="modal-title fw-bold m-0">{modoEdicion ? "📝 Editar Producto" : "✨ Crear Producto"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    
                    {/* NOMBRE DEL PRODUCTO */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Nombre del Repuesto</label>
                      <input type="text" name="nombre" value={productoActual.nombre} onChange={handleChange} className="form-control bg-light border-0 p-2" required placeholder="Ej. Filtro de Aceite" />
                    </div>

                    {/* ✅ CÓDIGO DE BARRAS: Input para escanear/escribir el código */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted"><FaBarcode /> Código de Barras (Opcional)</label>
                      <input 
                        type="text" 
                        name="codigo_barras" 
                        value={productoActual.codigo_barras} 
                        onChange={handleChange} 
                        className="form-control bg-light border-0 p-2 border-start border-primary border-4" 
                        placeholder="Escanea o escribe aquí..." 
                      />
                    </div>
                    
                    {/* CATEGORÍA */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Categoría</label>
                      <select 
                        name="categoria_id" 
                        value={productoActual.categoria_id || ""} 
                        onChange={handleChange} 
                        className="form-select bg-light border-0 p-2" 
                        required
                      >
                        <option value="" disabled>Seleccione Categoría...</option>
                        {categorias && categorias.length > 0 ? (
                          categorias.map((c) => (
                            <option key={c._id || c.id} value={c._id || c.id}>{c.nombre}</option>
                          ))
                        ) : (
                          <option value="" disabled>No hay categorías</option>
                        )}
                      </select>
                    </div>

                    {/* SELECT DE PROVEEDOR */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Proveedor</label>
                      <select 
                        name="proveedor_id" 
                        value={productoActual.proveedor_id || ""} 
                        onChange={handleChange} 
                        className="form-select bg-light border-0 p-2" 
                        required
                      >
                        <option value="" disabled>Seleccione Proveedor...</option>
                        {proveedores && proveedores.length > 0 ? (
                          proveedores.map((prov) => (
                            <option key={prov._id} value={prov._id}>{prov.nombreEmpresa}</option>
                          ))
                        ) : (
                          <option value="" disabled>No hay proveedores activos</option>
                        )}
                      </select>
                    </div>

                    {/* PRECIO Y STOCK */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Precio de Venta ($)</label>
                      <input type="number" step="0.01" min="0" name="precio" value={productoActual.precio} onChange={handleChange} className="form-control bg-light border-0 p-2" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Stock Inicial</label>
                      <input type="number" min="0" name="stock" value={productoActual.stock} onChange={handleChange} className="form-control bg-light border-0 p-2" required />
                    </div>
                    
                    {/* DESCRIPCIÓN E IMAGEN */}
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Descripción</label>
                      <textarea name="descripcion" value={productoActual.descripcion} onChange={handleChange} className="form-control bg-light border-0 p-2" rows="2" placeholder="Detalles técnicos..."></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Imagen del Producto (Opcional)</label>
                      <input type="file" accept="image/*" className="form-control border-0 p-2 bg-light" onChange={handleFileChange} />
                    </div>

                  </div>
                </div>
                <div className="modal-footer border-0 p-4">
                  <button type="button" className="btn btn-light px-4 fw-bold" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL PARA IMÁGENES */}
      {imagenModal && (
        <div className="modal show d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.9)", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 3000 }} onClick={() => setImagenModal(null)}>
          <img src={`${API_URL}/uploads/${imagenModal}`} alt="Zoom" className="img-fluid rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ maxHeight: "85vh", border: "3px solid white" }} />
        </div>
      )}
    </div>
  );
}