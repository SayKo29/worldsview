<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  
  let loading = false;
  let email = '';
  let password = '';
  let username = '';
  let isSignUp = false;
  let user = null;
  let error = null;
  
  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      user = data.session.user;
    }
    
    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user = session.user;
      } else if (event === 'SIGNED_OUT') {
        user = null;
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  });
  
  async function handleAuth() {
    try {
      loading = true;
      error = null;
      
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
      
      email = '';
      password = '';
      username = '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  async function handleSignOut() {
    try {
      loading = true;
      await supabase.auth.signOut();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  function toggleAuthMode() {
    isSignUp = !isSignUp;
    error = null;
  }
</script>

{#if user}
  <div class="auth-container logged-in">
    <div class="user-info">
      <span>Conectado como: <strong>{user.email}</strong></span>
    </div>
    <button on:click={handleSignOut} disabled={loading} class="sign-out-btn">
      {loading ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  </div>
{:else}
  <div class="auth-container">
    <h3>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
    
    <form on:submit|preventDefault={handleAuth} class="auth-form">
      {#if isSignUp}
        <div class="form-group">
          <label for="username">Nombre de usuario</label>
          <input
            id="username"
            type="text"
            placeholder="Tu nombre de usuario"
            bind:value={username}
          />
        </div>
      {/if}
      
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          placeholder="tu@email.com"
          required
          bind:value={email}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          placeholder="Tu contraseña"
          required
          bind:value={password}
        />
      </div>
      
      {#if error}
        <div class="error-message">{error}</div>
      {/if}
      
      <button type="submit" disabled={loading} class="auth-btn">
        {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
      </button>
    </form>
    
    <div class="auth-toggle">
      <button on:click={toggleAuthMode} class="toggle-btn">
        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  </div>
{/if}

<style>
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
</style> 