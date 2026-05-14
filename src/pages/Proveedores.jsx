import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // NUEVO: Estado para saber qué proveedor estamos editando (si es null, el modal está cerrado)
  const [proveedorEditando, setProveedorEditando] = useState(null);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const respuesta = await fetch("http://localhost:5000/api/proveedores");
      const datos = await respuesta.json();
      setProveedores(datos);
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar los proveedores:", error);
      setCargando(false);
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas desactivar este proveedor?")) {
      try {
        await fetch(`http://localhost:5000/api/proveedores/${id}`, {
          method: "DELETE",
        });
        obtenerProveedores();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // TU FUNCIÓN DE EDITAR
  const editarProveedor = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    
    try {
      const respuesta = await fetch(`http://localhost:5000/api/proveedores/${proveedorEditando._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proveedorEditando), // Enviamos los datos modificados en el modal
      });

      if (respuesta.ok) {
        obtenerProveedores();
        setProveedorEditando(null); // Cerramos el modal al terminar
        alert("Proveedor actualizado correctamente");
      } else {
        alert("Hubo un error al intentar actualizar el proveedor");
      }
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  // Función para manejar los cambios de texto en el Modal
  const handleEditChange = (e) => {
    setProveedorEditando({
      ...proveedorEditando,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container-fluid p-4" style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
      {/* Encabezado y Botón Nuevo */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Gestión de Proveedores</h2>
          <p className="text-muted">Administra las empresas que surten tu negocio</p>
        </div>
        <Link to="/proveedores/nuevo" className="btn btn-primary d-flex align-items-center shadow-sm">
          <span className="me-2">+</span> Nuevo Proveedor
        </Link>
      </div>

      {/* Tarjeta con la Tabla */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="py-3">Contacto</th>
                    <th className="py-3">Teléfono</th>
                    <th className="py-3">Email</th>
                    <th className="px-4 py-3 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No hay proveedores registrados todavía.
                      </td>
                    </tr>
                  ) : (
                    proveedores.map((proveedor) => (
                      <tr key={proveedor._id}>
                        <td className="px-4 fw-medium">{proveedor.nombreEmpresa}</td>
                        <td>{proveedor.nombreContacto || "N/A"}</td>
                        <td>{proveedor.telefono || "N/A"}</td>
                        <td>{proveedor.email || "N/A"}</td>
                        <td className="px-4 text-end">
                          
                          {/* 👇 BOTÓN MODIFICADO PARA ABRIR EL MODAL 👇 */}
                          <button 
                            onClick={() => setProveedorEditando(proveedor)} 
                            className="btn btn-sm btn-outline-secondary me-2"
                          >
                            ✏️
                          </button>

                          <button 
                            onClick={() => eliminarProveedor(proveedor._id)} 
                            className="btn btn-sm btn-outline-danger"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 👇 MODAL DE EDICIÓN 👇 */}
      {proveedorEditando && (
        <div className="modal" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Editar Proveedor</h5>
                <button type="button" className="btn-close" onClick={() => setProveedorEditando(null)}></button>
              </div>
              <form onSubmit={editarProveedor}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Empresa</label>
                    <input type="text" className="form-control" name="nombreEmpresa" value={proveedorEditando.nombreEmpresa} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Contacto</label>
                    <input type="text" className="form-control" name="nombreContacto" value={proveedorEditando.nombreContacto || ""} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Teléfono</label>
                    <input type="text" className="form-control" name="telefono" value={proveedorEditando.telefono || ""} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input type="email" className="form-control" name="email" value={proveedorEditando.email || ""} onChange={handleEditChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setProveedorEditando(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}