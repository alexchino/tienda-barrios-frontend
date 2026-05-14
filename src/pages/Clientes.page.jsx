
import React, { useState, useEffect } from "react";
import api from "../api/api"; // Usamos tu instancia configurada
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import Pagination from "../components/Pagination";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoCliente, setNuevoCliente] = useState({
    Nombre: "",
    Apellido: "",
    Telefono: "",
    Correo: "",
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err);
    }
  };

  const manejarCambio = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  const abrirModal = (cliente = null) => {
    if (cliente) {
      // En MongoDB usamos siempre _id
      setEditando(cliente._id);
      setNuevoCliente({
        Nombre: cliente.Nombre,
        Apellido: cliente.Apellido,
        Telefono: cliente.Telefono || "",
        Correo: cliente.Correo || "",
      });
    } else {
      setEditando(null);
      setNuevoCliente({ Nombre: "", Apellido: "", Telefono: "", Correo: "" });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => setMostrarModal(false);

  const guardarCliente = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/clientes/${editando}`, nuevoCliente);
      } else {
        await api.post("/clientes", nuevoCliente);
      }
      cerrarModal();
      obtenerClientes();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al guardar";
      alert("❌ " + msg);
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      obtenerClientes();
    } catch (err) {
      console.error("❌ Error al eliminar cliente:", err);
    }
  };

  // Filtrado de búsqueda simplificado para MongoDB
  const clientesFiltrados = clientes.filter((c) => {
    const term = busqueda.toLowerCase();
    return (
      c.Nombre.toLowerCase().includes(term) ||
      c.Apellido.toLowerCase().includes(term) ||
      (c.Correo && c.Correo.toLowerCase().includes(term))
    );
  });

  // Lógica de Paginación
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = clientesFiltrados.slice(indexFirst, indexLast);

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold m-0">👥 Gestión de Clientes</h2>
          <button className="btn btn-primary px-4 fw-bold" onClick={() => abrirModal()}>
            + Nuevo Cliente
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            className="form-control form-control-lg bg-light border-0"
            placeholder="🔍 Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: "35px", height: "35px", fontSize: "12px" }}>
                          {c.Nombre.charAt(0)}{c.Apellido.charAt(0)}
                        </div>
                        <span className="fw-bold">{`${c.Nombre} ${c.Apellido}`}</span>
                      </div>
                    </td>
                    <td>{c.Telefono || "—"}</td>
                    <td>{c.Correo || "—"}</td>
                    <td className="text-center">
                      <button onClick={() => abrirModal(c)} className="btn btn-light btn-sm me-2">
                        ✏️ Editar
                      </button>
                      <button onClick={() => eliminarCliente(c._id)} className="btn btn-outline-danger btn-sm">
                        🗑️ Borrar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-5 text-center text-muted">No se encontraron clientes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={clientesFiltrados.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      <Modal show={mostrarModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            {editando ? "Editar Cliente" : "Registrar Cliente"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={guardarCliente}>
          <Modal.Body className="px-4 pb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label className="small fw-bold">Nombre</Form.Label>
                <Form.Control type="text" name="Nombre" value={nuevoCliente.Nombre} onChange={manejarCambio} required />
              </div>
              <div className="col-md-6">
                <Form.Label className="small fw-bold">Apellido</Form.Label>
                <Form.Control type="text" name="Apellido" value={nuevoCliente.Apellido} onChange={manejarCambio} required />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Teléfono</Form.Label>
                <Form.Control type="text" name="Telefono" value={nuevoCliente.Telefono} onChange={manejarCambio} placeholder="+503 ...." />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                <Form.Control type="email" name="Correo" value={nuevoCliente.Correo} onChange={manejarCambio} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit" variant="primary" className="px-4">
              {editando ? "Actualizar" : "Guardar Cliente"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
} 