import React, { useRef } from "react";

export default function TicketVenta({ ticket, setTicket }) {
  const ticketRef = useRef(null);

  // 🛡️ VALIDACIÓN INICIAL: Si no hay ticket, no renderizamos nada
  if (!ticket) return null;

  // 🛡️ NORMALIZACIÓN: Nos aseguramos de tener un array de productos
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
            .mt-1 { margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h4>🧾 TICKET DE VENTA</h4>
            <p>${ticket.EmisorNombre || "TIENDA BARRIOS"}</p>
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
                  <td align="right">$${Number(p.PrecioUnitario * (p.Cantidad || p.cantidad)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr />
          
          <div class="flex fw-bold" style="font-size: 14px;"><span>TOTAL:</span> <span>$${Number(ticket.Total || 0).toFixed(2)}</span></div>
          
          ${ticket.Efectivo !== undefined ? `
            <div class="flex mt-1"><span>Efectivo Recibido:</span> <span>$${Number(ticket.Efectivo).toFixed(2)}</span></div>
            <div class="flex fw-bold mt-1"><span>Cambio / Vuelto:</span> <span>$${Number(ticket.Vuelto).toFixed(2)}</span></div>
          ` : ''}

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
    <div className="card mt-4 p-4 shadow-lg border-0 mx-auto" style={{ width: "380px", backgroundColor: "#fff", color: "#000" }}>
      <div ref={ticketRef}>
        <div className="text-center">
          <h5 className="fw-bold mb-1">🧾 TICKET DE VENTA</h5>
          <p className="text-muted small">{ticket.EmisorNombre || "Tienda Barrios"}</p>
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
            <tr className="border-bottom text-dark">
              <th>Producto</th>
              <th className="text-center">Cant</th>
              <th className="text-end">Subt</th>
            </tr>
          </thead>
          <tbody>
            {listaProductos.map((p, idx) => (
              <tr key={idx} className="text-dark">
                <td>{p.Nombre || p.nombre}</td>
                <td className="text-center">{p.Cantidad || p.cantidad}</td>
                <td className="text-end">${Number(p.PrecioUnitario * (p.Cantidad || p.cantidad)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" style={{ borderTop: "1px dashed #ccc" }} />

        <div className="small">
          <div className="d-flex justify-content-between fw-bold fs-5 mt-2 text-dark">
            <span>TOTAL:</span>
            <span>${Number(ticket.Total || 0).toFixed(2)}</span>
          </div>
          
          {/* --- INICIO DE LO NUEVO: Efectivo y Vuelto --- */}
          {ticket.Efectivo !== undefined && (
            <>
              <div className="d-flex justify-content-between text-secondary mt-2" style={{ fontSize: '0.9rem' }}>
                <span>Efectivo Recibido:</span>
                <span>${ticket.Efectivo.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold text-dark mt-1" style={{ fontSize: '0.95rem' }}>
                <span>Cambio / Vuelto:</span>
                <span>${ticket.Vuelto.toFixed(2)}</span>
              </div>
            </>
          )}
          {/* --- FIN DE LO NUEVO --- */}

        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-primary w-100 fw-bold shadow-sm" onClick={imprimirTicket}>
          🖨 Imprimir
        </button>
        <button className="btn btn-outline-secondary w-100 fw-bold border" onClick={() => setTicket(null)}>
          Cerrar
        </button>
      </div>
    </div>
  );
}