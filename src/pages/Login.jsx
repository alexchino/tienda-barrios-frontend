import React, { useState } from "react";
import api from "../api/api"; // Usamos nuestra instancia centralizada
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Enviamos la petición al backend de MongoDB
      const res = await api.post("/usuarios/login", {
        correo,
        password,
      });

      // ✅ MongoDB Atlas + JWT suelen devolver un token y los datos del usuario
      if (res.data.token) {
        const { _id, rol, nombre } = res.data.usuario;
        
        // Guardamos el TOKEN (esto es lo más importante para la seguridad)
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("usuarioId", _id);
        localStorage.setItem("rol", rol);
        localStorage.setItem("nombre", nombre);
        
        // También guardamos el objeto usuario completo para el Navbar
        localStorage.setItem("user", JSON.stringify(res.data.usuario));

        // Redirigir al dashboard usando redirección de JS para asegurar limpieza de estados
        window.location.href = "/dashboard";
      }
   } catch (err) {
   // Esto nos mostrará el mensaje real que viene del servidor
   console.log("DETALLE DEL ERROR:", err.response?.data || err.message);
   setError(err.response?.data?.mensaje || "Error de comunicación con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4" style={{ maxWidth: "400px", width: "100%", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: "3rem" }}>🚀</div>
          <h2 className="fw-bold text-dark">Sistema de Ventas</h2>
          <p className="text-muted small"> </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 text-center py-2 small shadow-sm">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Correo Electrónico</label>
            <input
              type="email"
              className="form-control form-control-lg bg-light border-0"
              placeholder="admin@correo.com"
              style={{ fontSize: "0.95rem" }}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Contraseña</label>
            <input
              type="password"
              className="form-control form-control-lg bg-light border-0"
              placeholder="••••••••"
              style={{ fontSize: "0.95rem" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 shadow-sm fw-bold" 
            disabled={loading}
            style={{ borderRadius: "10px", fontSize: "1rem" }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              "Ingresar ahora"
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-white border rounded-3 text-center" style={{ fontSize: "0.75rem" }}>
          <span className="text-muted fw-bold text-uppercase">Credenciales de acceso</span><br/>
          <code className="text-primary">admin@admin.com</code> / <code className="text-primary">123</code>
        </div>
      </div>
    </div>
  );
}