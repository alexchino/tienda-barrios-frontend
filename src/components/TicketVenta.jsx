import React, { useRef } from "react";

export default function TicketVenta({ ticket, setTicket }) {
  const ticketRef = useRef(null);

  // 🛡️ VALIDACIÓN INICIAL: Si no hay ticket, no renderizamos nada
  if (!ticket) return null;

  // 🛡️ NORMALIZACIÓN: Nos aseguramos de tener un array de productos
  // Esto evita el error del .map() si la propiedad viene como undefined
  const listaProductos = ticket.productos || ticket.Productos || [];

  const imprimirTicket = () => {
    if (!ticketRef.current) return;

    const ventana = window.open("", "PRINT", "width=400,height=600");
    
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket - PosSystem</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; width: 280px; }
            .text-center { text-align: center; }
            hr { border: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            .flex { display: flex; justify-content: space-between; }
            .fw-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h4>🧾 TICKET DE VENTA</h4>
            <p>${ticket.EmisorNombre || "SISTEMA DE VENTAS"}</p>
          </div>
          <hr />
          <p><strong>Cliente:</strong> ${ticket.NombreCliente || "Consumidor Final"}</p>
          <p><strong>Fecha:</strong> ${new Date(ticket.Fecha).toLocaleString()}</p>
          <hr />
          <table>
            <thead>
              <tr>
                <th align="left">Prod.</th>
                <th>Cant.</th>
                <th align="right">Subt.</th>
              </tr>
            </thead>
            <tbody>
              ${listaProductos.map(p => `
                <tr>
                  <td>${p.Nombre || p.nombre}</td>
                  <td align="center">${p.Cantidad || p.cantidad}</td>
                  <td align="right">$${Number(p.Subtotal || p.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr />
          <div class="flex"><span>Subtotal:</span> <span>$${Number(ticket.Subtotal || 0).toFixed(2)}</span></div>
          <div class="flex"><span>IVA:</span> <span>$${Number(ticket.IVA || 0).toFixed(2)}</span></div>
          <div class="flex fw-bold"><span>TOTAL:</span> <span>$${Number(ticket.Total || 0).toFixed(2)}</span></div>
          <hr />
          <p class="text-center">¡Gracias por su compra!</p>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 250);
  };

  return (
    <div className="card mt-4 p-4 shadow-lg border-0 mx-auto" style={{ width: "380px", backgroundColor: "#fff" }}>
      <div ref={ticketRef}>
        <div className="text-center">
          <h5 className="fw-bold mb-1">🧾 TICKET DE VENTA</h5>
          <p className="text-muted small">{ticket.EmisorNombre || "Empresa de San Alejo"}</p>
        </div>
        
        <div className="small mt-3">
          <div className="d-flex justify-content-between">
            <span className="fw-bold">Cliente:</span>
            <span>{ticket.NombreCliente || "Consumidor Final"}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="fw-bold">Fecha:</span>
            <span>{new Date(ticket.Fecha).toLocaleDateString()}</span>
          </div>
        </div>

        <hr className="my-3" style={{ borderTop: "1px dashed #ccc" }} />

        <table className="table table-sm table-borderless small">
          <thead>
            <tr className="border-bottom">
              <th>Producto</th>
              <th className="text-center">Cant</th>
              <th className="text-end">Subt</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ Usamos listaProductos que ya validamos arriba */}
            {listaProductos.map((p, idx) => (
              <tr key={idx}>
                <td>{p.Nombre || p.nombre}</td>
                <td className="text-center">{p.Cantidad || p.cantidad}</td>
                <td className="text-end">${Number(p.Subtotal || p.subtotal || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" style={{ borderTop: "1px dashed #ccc" }} />

        <div className="small">
          <div className="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>${Number(ticket.Subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold fs-6 mt-2">
            <span>TOTAL:</span>
            <span className="text-success">${Number(ticket.Total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-primary w-100 fw-bold shadow-sm" onClick={imprimirTicket}>
          🖨 Imprimir
        </button>
        <button className="btn btn-light w-100 border" onClick={() => setTicket(null)}>
          Cerrar
        </button>
      </div>
    </div>
  );
}