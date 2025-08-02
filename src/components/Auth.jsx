import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getInitialSession() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    }
    
    getInitialSession();
    
    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  async function handleAuth(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0]
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        alert('¡Revisa tu correo electrónico para confirmar tu cuenta!');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
      }
      
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSignOut() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  
  function toggleAuthMode() {
    setIsSignUp(!isSignUp);
    setError(null);
  }

  return user ? (
    <div className="auth-container logged-in">
      <div className="user-info">
        <span>Conectado como: <strong>{user.email}</strong></span>
      </div>
      <button onClick={handleSignOut} disabled={loading} className="sign-out-btn">
        {loading ? 'Saliendo...' : 'Cerrar sesión'}
      </button>

      <style jsx="true">{`
        .auth-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .logged-in {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .sign-out-btn {
          background: transparent;
          border: 1px solid var(--primary-color, #e67e22);
          color: var(--primary-color, #e67e22);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .sign-out-btn:hover {
          background: var(--primary-color, #e67e22);
          color: white;
        }
      `}</style>
    </div>
  ) : (
    <div className="auth-container">
      <h3>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
      
      <form onSubmit={handleAuth} className="auth-form">
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Tu contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </form>
      
      <div className="auth-toggle">
        <button onClick={toggleAuthMode} className="toggle-btn">
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>

      <style jsx="true">{`
        .auth-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        label {
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        input {
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid var(--border-color, #ccc);
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main, #333);
        }
        
        .auth-btn {
          background: var(--primary-color, #e67e22);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .auth-btn:hover {
          background: var(--primary-color-dark, #d35400);
        }
        
        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .auth-toggle {
          margin-top: 1rem;
          text-align: center;
        }
        
        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--primary-color, #e67e22);
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.9rem;
          padding: 0.5rem;
          background: rgba(231, 76, 60, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}