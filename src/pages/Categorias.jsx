import React, { useState, useEffect } from "react";
import api from "../api/api"; 
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination"; 
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFolderOpen } from "react-icons/fa";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState({
    _id: "",
    nombre: "",
    descripcion: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [paginaActual, setPaginaActual] = useState(1);
  const categoriasPorPagina = 6;

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categorias");
      // Mapeo seguro para que el resto del código siempre use minúsculas
      const dataNormalizada = (res.data || []).map(cat => ({
        _id: cat._id || cat.id,
        nombre: cat.nombre || cat.Nombre || "",
        descripcion: cat.descripcion || cat.Descripcion || ""
      }));
      setCategorias(dataNormalizada);
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCategoriaActual({
      ...categoriaActual,
      [e.target.name]: e.target.value,
    });
  };

  const abrirModalAgregar = () => {
    // Importante: Usar "" en lugar de null para evitar que el input falle
    setCategoriaActual({ _id: "", nombre: "", descripcion: "" });
    setModoEdicion(false);
    setShowModal(true);
  };

  const abrirModalEditar = (cat) => {
    setCategoriaActual({
        _id: cat._id,
        nombre: cat.nombre || "",
        descripcion: cat.descripcion || ""
    });
    setModoEdicion(true);
    setShowModal(true);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    try {
      const dataAEnviar = {
        nombre: categoriaActual.nombre,
        descripcion: categoriaActual.descripcion
      };

      if (modoEdicion) {
        await api.put(`/categorias/${categoriaActual._id}`, dataAEnviar);
      } else {
        await api.post("/categorias", dataAEnviar);
      }
      
      setShowModal(false);
      obtenerCategorias();
      alert("✨ Categoría guardada con éxito");
    } catch (error) {
      alert("❌ " + (error.response?.data?.mensaje || "Error al procesar"));
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      obtenerCategorias();
    } catch (error) {
      alert("⚠️ Error: " + (error.response?.data?.mensaje || "No se pudo eliminar"));
    }
  };

  const categoriasFiltradas = categorias.filter((c) =>
    (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (paginaActual - 1) * categoriasPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(inicio, inicio + categoriasPorPagina);

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center">
          <FaFolderOpen className="text-primary me-2" /> Categorías
        </h2>
        <button className="btn btn-primary px-4 fw-bold rounded-pill" onClick={abrirModalAgregar}>
          <FaPlus className="me-2" /> Nueva Categoría
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body d-flex align-items-center bg-light rounded-4">
          <FaSearch className="text-muted ms-2" />
          <input
            className="form-control border-0 bg-transparent fs-5 shadow-none"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2 text-muted">Cargando categorías...</p>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {categoriasPaginadas.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted">No se encontraron categorías.</div>
            ) : (
                categoriasPaginadas.map((cat) => (
                    <div key={cat._id} className="col-xl-4 col-md-6">
                      <div className="card shadow-sm h-100 border-0" 
                           style={{ borderRadius: "20px" }}>
                        <div className="card-body p-4" onClick={() => navigate(`/productos/categoria/${cat._id}`)} style={{cursor: 'pointer'}}>
                          <h5 className="fw-bold text-dark mb-2">{cat.nombre}</h5>
                          <p className="text-muted small mb-4" style={{ minHeight: "45px" }}>
                            {cat.descripcion || "Sin descripción disponible."}
                          </p>
                        </div>
                        <div className="card-footer bg-transparent border-0 p-4 pt-0">
                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-warning btn-sm flex-fill fw-bold rounded-pill" 
                                    onClick={() => abrirModalEditar(cat)}>
                                <FaEdit className="me-1"/> Editar
                            </button>
                            <button className="btn btn-outline-danger btn-sm flex-fill fw-bold rounded-pill" 
                                    onClick={() => eliminarCategoria(cat._id)}>
                                <FaTrash className="me-1"/> Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
            )}
          </div>

          <Pagination 
            totalItems={categoriasFiltradas.length}
            itemsPerPage={categoriasPorPagina}
            currentPage={paginaActual}
            onPageChange={setPaginaActual}
          />
        </>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0 p-4">
                <h5 className="modal-title fw-bold m-0">{modoEdicion ? "Actualizar" : "Crear"} Categoría</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={guardarCategoria}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Nombre de la Categoría</label>
                    <input
                      name="nombre"
                      className="form-control border-0 bg-light p-3 shadow-none"
                      value={categoriaActual.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej. Llantas"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control border-0 bg-light p-3 shadow-none"
                      rows="3"
                      value={categoriaActual.descripcion}
                      onChange={handleChange}
                      placeholder="Breve descripción de la categoría..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-4">
                  <button type="button" className="btn btn-light px-4 fw-bold" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                    {modoEdicion ? "Guardar Cambios" : "Crear Categoría"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}