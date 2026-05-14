import React from "react";

/**
 * Componente de Paginación
 * @param {number} totalItems - Total de registros en la base de datos
 * @param {number} itemsPerPage - Cuántos registros mostrar por página
 * @param {number} currentPage - La página donde está el usuario actualmente
 * @param {function} onPageChange - Función para actualizar el estado de la página
 */
export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Si no hay más de una página, no mostramos nada
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Navegación de tablas" className="mt-4">
      <ul className="pagination justify-content-center shadow-sm">
        {/* Botón Anterior */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">&laquo;</span> Anterior
          </button>
        </li>

        {/* Números de Página */}
        {pages.map((p) => (
          <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(p)}
              style={currentPage === p ? { zIndex: 0 } : {}}
            >
              {p}
            </button>
          </li>
        ))}

        {/* Botón Siguiente */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}