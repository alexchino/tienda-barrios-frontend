import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("vendedor");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/usuarios", {
        nombre,
        correo,
        password, // Asegúrate de que el backend espera 'contrasena'
        rol,
      });
      
      // Usamos .mensaje porque así lo definimos en el backend
      alert("✨ " + res.data.mensaje);
      navigate("/"); // Redirigir al login tras el éxito
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detalle || error.response?.data?.mensaje || "Error al conectar con el servidor";
      alert("❌ Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4" style={{ maxWidth: "450px", width: "100%", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success">Crear Cuenta</h2>
          <p className="text-muted small">Registra un nuevo usuario en el sistema</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Nombre Completo</label>
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="Ej. Alexander Canales"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Correo Electrónico</label>
            <input
              type="email"
              className="form-control bg-light border-0"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Contraseña</label>
            <input
              type="password"
              className="form-control bg-light border-0"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Rol del Usuario</label>
            <select 
              className="form-select bg-light border-0"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-success btn-lg w-100 shadow-sm fw-bold mb-3"
            disabled={loading}
            style={{ borderRadius: "10px" }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              "Registrar Usuario"
            )}
          </button>

          <div className="text-center">
            <Link to="/" className="text-decoration-none small fw-bold text-primary">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}