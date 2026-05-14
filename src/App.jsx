import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// ✅ 1. Importación del Contexto del Tema
import { ThemeProvider } from "./context/ThemeContext";

// Páginas
import Login from "./pages/Login";
import HistorialCotizaciones from "./pages/HistorialCotizaciones";
import Register from "./pages/Register";
import VentasHistorial from "./pages/VentasHistorial";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores";
import NuevoProveedor from "./pages/NuevoProveedor";
import Dashboard from "./pages/Dashboard";
import Categorias from "./pages/Categorias";
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes.page";
import VentasPage from "./pages/Ventas";
import Reportes from "./pages/Reportes";
import ProductosPorCategoria from "./pages/ProductosPorCategoria";
import Cotizaciones from "./pages/Cotizaciones";
import EditarCotizacion from "./pages/EditarCotizacion";

// Componentes
import Layout from "./components/Layout";

/**
 * 🔒 COMPONENTE DE RUTA PROTEGIDA
 * Verifica si existe un token en el localStorage.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function AppContent() {
  const location = useLocation();

  // Definimos las rutas que no llevan Sidebar
  const sinSidebar = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {sinSidebar ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            {/* Todas las rutas internas están envueltas en PrivateRoute */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
            <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
            <Route path="/productos/categoria/:categoria_id" element={<PrivateRoute><ProductosPorCategoria /></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
            <Route path="/cotizaciones/historial" element={<PrivateRoute><HistorialCotizaciones /></PrivateRoute>} />
            <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
            <Route path="/ventas" element={<PrivateRoute><VentasPage /></PrivateRoute>} />
            <Route path="/cotizaciones" element={<PrivateRoute><Cotizaciones /></PrivateRoute>} />
            <Route path="/cotizaciones/editar/:id" element={<PrivateRoute><EditarCotizacion /></PrivateRoute>} />
            <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
            <Route path="/ventas-historial" element={<PrivateRoute><VentasHistorial /></PrivateRoute>} />
            <Route path="/proveedores/nuevo" element={<PrivateRoute><NuevoProveedor /></PrivateRoute>} />
            <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
            {/* Redirigir cualquier ruta desconocida al Dashboard o Login */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

// ✅ 2. APLICACIÓN PRINCIPAL
export default function App() {
  return (
    // ¡Envolvemos el Router con el ThemeProvider para que controle toda la app!
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}