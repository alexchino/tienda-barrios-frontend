import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [usuarioData, setUsuarioData] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "",
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 7;

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    setCargando(true);
    try {
      const res = await axios.get("https://tienda-barrios-backend.onrender.com/api/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirModal = (usuario = null) => {
    if (usuario) {
      setEditando(usuario.id);
      setUsuarioData({
        nombre: usuario.nombre,
        correo: usuario.correo,
        password: "",
        rol: usuario.rol,
      });
    } else {
      setEditando(null);
      setUsuarioData({ nombre: "", correo: "", password: "", rol: "" });
    }
    setMostrarModal(true);
  };

  const handleCerrarModal = () => setMostrarModal(false);

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        await axios.put(
          `https://tienda-barrios-backend.onrender.com/api/usuarios/${editando}`,
          usuarioData
        );
      } else {
        await axios.post("https://tienda-barrios-backend.onrender.com/api/usuarios", usuarioData);
      }
      await obtenerUsuarios();
      setMostrarModal(false);
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
      alert("Error al guardar usuario");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await axios.delete(`https://tienda-barrios-backend.onrender.com/api/usuarios/${id}`);
      await obtenerUsuarios();
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      alert("Error al eliminar usuario");
    }
  };

  // Filtro de búsqueda
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación lógica
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(
    indiceInicio,
    indiceInicio + usuariosPorPagina
  );
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  return (
    <div className="container mt-5">
      {/* Header con buscador y botón */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center" style={{ gap: "10px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar usuario..."
            style={{ width: "250px" }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => handleAbrirModal()}>
          ➕ Agregar Usuario
        </button>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="text-center text-muted">Cargando usuarios...</p>
      ) : usuariosPaginados.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleAbrirModal(u)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarUsuario(u.id)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginador */}
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                >
                  Anterior
                </button>
              </li>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    paginaActual === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPaginaActual(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  paginaActual === totalPaginas ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        <p className="text-center text-muted">No hay usuarios registrados.</p>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editando ? "Editar Usuario" : "Agregar Usuario"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCerrarModal}
                ></button>
              </div>
              <form onSubmit={handleGuardarUsuario}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={usuarioData.nombre}
                      onChange={(e) =>
                        setUsuarioData({
                          ...usuarioData,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      value={usuarioData.correo}
                      onChange={(e) =>
                        setUsuarioData({
                          ...usuarioData,
                          correo: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {editando ? "Nueva Contraseña (opcional)" : "Contraseña"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={usuarioData.password}
                      onChange={(e) =>
                        setUsuarioData({
                          ...usuarioData,
                          password: e.target.value,
                        })
                      }
                      placeholder={editando ? "Deja en blanco para no cambiar" : ""}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={usuarioData.rol}
                      onChange={(e) =>
                        setUsuarioData({ ...usuarioData, rol: e.target.value })
                      }
                      required
                    >
                      <option value="">Seleccionar rol...</option>
                      <option value="admin">Administrador</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCerrarModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : editando
                      ? "Actualizar"
                      : "Guardar"}
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
