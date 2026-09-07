import { useAuth } from "react-oidc-context";
import { useState } from "react";
import './App.css';

function App() {
  const auth = useAuth();
  const [mensajeBackend, setMensajeBackend] = useState("");

  const consultarBackend = async () => {
    try {
      const respuesta = await fetch("http://localhost:8080/api/datos", {
        method: "GET",
        headers: {
          // Aquí es donde ocurre la magia: enviamos la llave al guardia
          Authorization: `Bearer ${auth.user?.access_token}`
        }
      });
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setMensajeBackend(datos.mensaje);
      } else {
        setMensajeBackend(`Error: Acceso denegado (Código ${respuesta.status})`);
      }
    } catch (error) {
      setMensajeBackend("Error: No se pudo conectar. ¿Está encendido Spring Boot?");
    }
  };

  if (auth.isLoading) return <div>Cargando estado de seguridad...</div>;
  if (auth.error) return <div>Error de autenticación: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div className="card">
        <h1>¡Bienvenido a Pedidos360!</h1>
        <p>Sesión activa para: <strong>{auth.user?.profile.email}</strong></p>
        
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Prueba de Integración EP1</h3>
          <button onClick={consultarBackend} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
            Consumir API Protegida
          </button>
          
          {mensajeBackend && (
            <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#007BFF' }}>
              Respuesta del servidor: {mensajeBackend}
            </p>
          )}
        </div>

        <button onClick={() => auth.removeUser()} style={{ marginTop: '30px' }}>
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Pedidos360</h1>
      <p>Sistema protegido corporativo.</p>
      <button onClick={() => auth.signinRedirect()}>
        Iniciar Sesión con Cognito
      </button>
    </div>
  );
}

export default App;