import { useAuth } from "react-oidc-context";
import './App.css';

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Cargando estado de seguridad...</div>;
  }

  if (auth.error) {
    return <div>Error de autenticación: {auth.error.message}</div>;
  }

  // Vista cuando el usuario ingresa correctamente
  if (auth.isAuthenticated) {
    return (
      <div className="card">
        <h1>¡Bienvenido a Pedidos360!</h1>
        <p>Sesión activa para: <strong>{auth.user?.profile.email}</strong></p>
        
        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <p>Tu Access Token (JWT):</p>
          <textarea 
            readOnly 
            rows="6" 
            style={{ width: '100%', fontSize: '12px' }} 
            value={auth.user?.access_token} 
          />
        </div>
        
        <button onClick={() => auth.removeUser()} style={{ marginTop: '20px' }}>
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Vista para usuarios no autenticados
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