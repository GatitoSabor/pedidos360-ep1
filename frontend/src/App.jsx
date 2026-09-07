import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import './App.css';

function App() {
  const auth = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [errorApi, setErrorApi] = useState("");
  
  const [descripcion, setDescripcion] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [comentarios, setComentarios] = useState({});

  const obtenerRoles = () => {
    if (!auth.user?.access_token) return { isSolicitante: false, isAprobador: false };
    try {
      const payload = JSON.parse(atob(auth.user.access_token.split('.')[1]));
      let groups = payload["cognito:groups"] || [];
      if (typeof groups === 'string') groups = [groups];

      return {
        isSolicitante: groups.includes('solicitante') || payload.sub, // Fallback temporal para pruebas
        isAprobador: groups.includes('aprobador') || payload.sub
      };
    } catch (e) {
      return { isSolicitante: true, isAprobador: true }; // Si falla el decode, abrimos vistas para evitar bloqueos visuales
    }
  };

  const { isSolicitante, isAprobador } = obtenerRoles();

  const cargarPedidos = async () => {
    try {
      setErrorApi("");
      const respuesta = await fetch("http://localhost:8080/api/datos", {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` }
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setPedidos(data);
      } else {
        setErrorApi(`Error al cargar: ${respuesta.status} - ${respuesta.statusText}`);
      }
    } catch (error) {
      setErrorApi("No se pudo conectar con el backend en http://localhost:8080");
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      cargarPedidos();
    }
  }, [auth.isAuthenticated]);

  const crearPedido = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch("http://localhost:8080/api/datos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.user?.access_token}` 
        },
        body: JSON.stringify({ descripcion, montoTotal: parseFloat(montoTotal) || 0 })
      });
      if (respuesta.ok) {
        setDescripcion("");
        setMontoTotal("");
        cargarPedidos();
      }
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };

  const revisarPedido = async (id, estado) => {
    const comentario = comentarios[id] || "";
    try {
      const respuesta = await fetch(`http://localhost:8080/api/datos/${id}/revision`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.user?.access_token}` 
        },
        body: JSON.stringify({ estado: estado, comentarioAprobador: comentario })
      });
      if (respuesta.ok) {
        setComentarios({ ...comentarios, [id]: "" });
        cargarPedidos();
      }
    } catch (error) {
      console.error("Error al revisar:", error);
    }
  };

  const handleComentarioChange = (id, valor) => {
    setComentarios({ ...comentarios, [id]: valor });
  };

  if (auth.isLoading) return <div>Cargando estado de seguridad...</div>;
  if (auth.error) return <div>Error de autenticación: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Portal Corporativo</h2>
          <button onClick={() => auth.signoutRedirect()} style={{ backgroundColor: '#dc3545', color: 'white' }}>
            Cerrar Sesión
          </button>
        </div>
        <p>Usuario: <strong>{auth.user?.profile.email}</strong></p>
        <hr />

        {errorApi && (
          <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '15px', borderRadius: '5px' }}>
            {errorApi}
          </div>
        )}

        {isSolicitante && (
          <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Ingresar Nueva Solicitud</h3>
            <form onSubmit={crearPedido} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" placeholder="Ej: Solicitar vacaciones" required
                value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              />
              <input 
                type="number" placeholder="Monto (Opcional)"
                value={montoTotal} onChange={(e) => setMontoTotal(e.target.value)}
              />
              <button type="submit" style={{ backgroundColor: '#28a745', color: 'white' }}>Crear</button>
            </form>
          </div>
        )}

        <h3>Estado de Solicitudes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              {isAprobador && <th>Acción de Jefatura</th>}
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 0' }}>#{p.id}</td>
                <td>{p.descripcion}</td>
                <td>
                  <strong style={{ 
                    color: p.estado === 'PENDIENTE' ? '#ffc107' : p.estado === 'APROBADO' ? '#28a745' : '#dc3545' 
                  }}>
                    {p.estado}
                  </strong>
                  {p.comentarioAprobador && <div style={{ fontSize: '0.8em', color: '#666' }}>Nota: {p.comentarioAprobador}</div>}
                </td>
                
                {isAprobador && (
                  <td>
                    {p.estado === 'PENDIENTE' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <input 
                          type="text" placeholder="Comentario (opcional)" 
                          value={comentarios[p.id] || ""} 
                          onChange={(e) => handleComentarioChange(p.id, e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => revisarPedido(p.id, 'APROBADO')} style={{ backgroundColor: '#007bff', color: 'white', padding: '5px' }}>Aprobar</button>
                          <button onClick={() => revisarPedido(p.id, 'RECHAZADO')} style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px' }}>Rechazar</button>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.9em', color: '#999' }}>Revisado</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay solicitudes registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h1>Pedidos360</h1>
      <p>Sistema de Flujo de Aprobaciones corporativo.</p>
      <button onClick={() => auth.signinRedirect()}>
        Iniciar Sesión Seguro
      </button>
    </div>
  );
}

export default App;