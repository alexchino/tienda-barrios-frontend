import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api"; // Tu instancia de Axios configurada
import { useParams, useNavigate } from "react-router-dom";
// ✅ CÓDIGO DE BARRAS: Importamos FaBarcode
import { FaArrowLeft, FaPlus, FaBoxOpen, FaBarcode } from "react-icons/fa";
import Pagination from "../components/Pagination";

export default function ProductosPorCategoria() {
  const { categoria_id } = useParams();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    codigo_barras: "", // ✅ CÓDIGO DE BARRAS: Añadido al estado inicial
    descripcion: "",
    precio: "",
    stock: "",
    proveedor_id: "", 
    imagen: null,
  });

  // 📄 ESTADOS DE PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;

  // ✅ OBTENER PRODUCTOS Y PROVEEDORES
  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [resProd, resProv] = await Promise.all([
        api.get(`/productos/categoria/${categoria_id}`),
        api.get("/proveedores")
      ]);
      
      setProductos(resProd.data.map(p => ({
        ...p,
        id: p._id 
      })));
      setProveedores(resProv.data || []);

    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  }, [categoria_id]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // 📄 LÓGICA DE FILTRADO PARA PAGINACIÓN
  const inicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productos.slice(inicio, inicio + productosPorPagina);

  const handleChange = (e) => {
    setNuevoProducto({
      ...nuevoProducto,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setNuevoProducto({
      ...nuevoProducto,
      imagen: e.target.files[0],
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!nuevoProducto.proveedor_id) {
      return alert("⚠️ Por favor, selecciona un proveedor de la lista.");
    }

    try {
      const formData = new FormData();
      formData.append("nombre", nuevoProducto.nombre);
      // ✅ CÓDIGO DE BARRAS: Lo enviamos al backend
      formData.append("codigo_barras", nuevoProducto.codigo_barras || ""); 
      formData.append("descripcion", nuevoProducto.descripcion);
      formData.append("precio", nuevoProducto.precio);
      formData.append("stock", nuevoProducto.stock);
      formData.append("categoria_id", categoria_id);
      formData.append("proveedor_id", nuevoProducto.proveedor_id); 

      if (nuevoProducto.imagen) {
        formData.append("imagen", nuevoProducto.imagen); 
      }

      await api.post("/productos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      // ✅ CÓDIGO DE BARRAS: Limpiamos el campo también
      setNuevoProducto({ nombre: "", codigo_barras: "", descripcion: "", precio: "", stock: "", proveedor_id: "", imagen: null });
      obtenerDatos(); 
      alert("✨ Producto guardado con éxito");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error al guardar: " + (error.response?.data?.mensaje || "Revisa el backend"));
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div><p>Cargando...</p></div>;

  return (
    <div className="container-fluid p-4">
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Volver
        </button>
        <h4 className="fw-bold m-0"><FaBoxOpen className="me-2 text-primary" /> Productos</h4>
        <button className="btn btn-success shadow-sm" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Agregar Producto
        </button>
      </div>

      {/* Grid de Productos */}
      <div className="row g-4">
        {productosPaginados.length === 0 ? (
          <div className="col-12 text-center py-5"><p className="text-muted">No hay productos aún.</p></div>
        ) : (
          productosPaginados.map((p) => (
            <div key={p.id} className="col-xl-3 col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div style={{ height: "180px" }} className="bg-light">
                  {p.imagen ? (
                    <img src={`https://tienda-barrios-backend.onrender.com/${p.imagen}`} alt={p.nombre} className="w-100 h-100" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-muted">Sin imagen</div>
                  )}
                </div>
                <div className="card-body">
                  <h6 className="fw-bold mb-1">{p.nombre}</h6>
                  
                  {/* ✅ CÓDIGO DE BARRAS: Lo mostramos en la tarjeta */}
                  <p className="small text-muted mb-2">
                    <FaBarcode className="me-1" /> {p.codigo_barras || "N/A"}
                  </p>

                  <p className="small text-muted text-truncate">{p.descripcion}</p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-success-subtle text-success fs-6">${p.precio}</span>
                    <span className="small">Stock: {p.stock}</span>
                  </div>
                  <div className="text-muted small">
                     <i className="me-1">🚚</i> {p.proveedor_id?.nombreEmpresa || "Sin Proveedor"}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {productos.length > 0 && (
        <Pagination 
          totalItems={productos.length} 
          itemsPerPage={productosPorPagina} 
          currentPage={paginaActual} 
          onPageChange={(page) => setPaginaActual(page)} 
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Nuevo Producto</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Nombre</label>
                    <input name="nombre" value={nuevoProducto.nombre} className="form-control bg-light" onChange={handleChange} required />
                  </div>

                  {/* ✅ CÓDIGO DE BARRAS: Nuevo input para el formulario */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small"><FaBarcode className="me-1"/>Código de Barras (Opcional)</label>
                    <input 
                      name="codigo_barras" 
                      value={nuevoProducto.codigo_barras} 
                      className="form-control bg-light border-start border-primary border-4" 
                      placeholder="Escanea o escribe aquí..." 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold small">Precio</label>
                      <input name="precio" value={nuevoProducto.precio} type="number" step="0.01" className="form-control bg-light" onChange={handleChange} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold small">Stock</label>
                      <input name="stock" value={nuevoProducto.stock} type="number" className="form-control bg-light" onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Proveedor</label>
                    <select 
                      name="proveedor_id" 
                      value={nuevoProducto.proveedor_id} 
                      onChange={handleChange} 
                      className="form-select bg-light" 
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

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Descripción</label>
                    <textarea name="descripcion" value={nuevoProducto.descripcion} className="form-control bg-light" rows="2" onChange={handleChange}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Imagen</label>
                    <input type="file" accept="image/*" className="form-control bg-light" onChange={handleFileChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}