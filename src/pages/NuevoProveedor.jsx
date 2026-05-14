import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function NuevoProveedor() {
  const navigate = useNavigate();
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    nombreContacto: "",
    telefono: "",
    email: "",
    direccion: ""
  });
  const [cargando, setCargando] = useState(false);

  // Maneja los cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Enviar los datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      const respuesta = await fetch("http://localhost:5000/api/proveedores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (respuesta.ok) {
        // Si se guarda con éxito, volvemos a la tabla de proveedores
        navigate("/proveedores");
      } else {
        alert("Error al guardar el proveedor. Verifica los datos.");
        setCargando(false);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión con el servidor.");
      setCargando(false);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Nuevo Proveedor</h2>
          <p className="text-muted">Registra una nueva empresa en el sistema</p>
        </div>
        <Link to="/proveedores" className="btn btn-outline-secondary">
          Volver a la lista
        </Link>
      </div>

      <div className="card shadow-sm border-0" style={{ maxWidth: "800px" }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Nombre de la Empresa *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="nombreEmpresa" 
                  value={formData.nombreEmpresa} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ej. Distribuidora El Sol"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Nombre del Contacto</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="nombreContacto" 
                  value={formData.nombreContacto} 
                  onChange={handleChange} 
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Teléfono</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  placeholder="Ej. 555-1234"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="ejemplo@empresa.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Dirección</label>
              <textarea 
                className="form-control" 
                name="direccion" 
                value={formData.direccion} 
                onChange={handleChange} 
                rows="2" 
                placeholder="Dirección física de la empresa"
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/proveedores" className="btn btn-light border">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Proveedor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}