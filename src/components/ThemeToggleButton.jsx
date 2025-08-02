import React, { useState, useEffect } from 'react';

export default function ThemeToggleButton() {
  // Estado para el tema actual
  const [currentTheme, setCurrentTheme] = useState('light');
  
  // Detectar el tema inicial al cargar
  useEffect(() => {
    // Función para detectar el tema actual del documento
    const detectTheme = () => {
      return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    };
    
    // Establecer el tema inicial
    const initialTheme = detectTheme();
    setCurrentTheme(initialTheme);
    console.log('Tema inicial detectado:', initialTheme);
    
    // Función para manejar cambios de tema
    const handleThemeChange = () => {
      const newTheme = detectTheme();
      setCurrentTheme(newTheme);
      console.log('Tema actualizado por evento:', newTheme);
    };
    
    // Escuchar eventos de cambio de tema
    window.addEventListener('themechange', handleThemeChange);
    document.addEventListener('astro:page-load', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      document.removeEventListener('astro:page-load', handleThemeChange);
    };
  }, []);
  
  // Manejador de clic simplificado y robusto
  const handleClick = () => {
    // Determinar el nuevo tema
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    console.log('Cambiando tema de', currentTheme, 'a', newTheme);
    
    try {
      // 1. Actualizar clases en documentElement
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${newTheme}`);
      
      // 2. Actualizar el data-attribute
      document.documentElement.dataset.theme = newTheme;
      
      // 3. Actualizar localStorage
      localStorage.setItem('theme', newTheme);
      
      // 4. Actualizar el estado local
      setCurrentTheme(newTheme);
      
      // 5. Emitir evento personalizado
      const event = new CustomEvent('themechange', {
        detail: { theme: newTheme },
        bubbles: true
      });
      window.dispatchEvent(event);
      
      console.log('✅ Tema cambiado exitosamente a:', newTheme);
    } catch (error) {
      console.error('❌ Error al cambiar el tema:', error);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`theme-toggle ${currentTheme}`}
      aria-label={currentTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <div className="toggle-track">
        <div className="toggle-indicator">
          {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </div>
      </div>
      <span className="sr-only">
        {currentTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      </span>
      
      <style jsx="true">{`
        .theme-toggle {
          position: relative;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          width: 54px;
          height: 28px;
          outline: none;
        }
        
        .toggle-track {
          width: 54px;
          height: 28px;
          border-radius: 30px;
          background: linear-gradient(to right, #ff6b6b, #ffa742);
          position: relative;
          transition: all 0.4s cubic-bezier(.25,.75,.5,1.25);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.1),
            inset 0 0 0 2px rgba(255,255,255,0.2),
            inset 0 0 8px rgba(0,0,0,0.2),
            0 2px 10px rgba(0,0,0,0.2);
        }
        
        .theme-toggle.dark .toggle-track {
          background: linear-gradient(to right, #2c3e50, #4b6cb7);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.1),
            inset 0 0 0 2px rgba(255,255,255,0.1),
            inset 0 0 8px rgba(0,0,0,0.5),
            0 2px 10px rgba(0,0,0,0.2);
        }
        
        .toggle-indicator {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          transform: translateX(0);
          transition: all 0.4s cubic-bezier(.25,.75,.5,1.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6b6b;
          box-shadow: 
            0 2px 4px rgba(0,0,0,0.2),
            0 0 2px rgba(0,0,0,0.4);
        }
        
        .theme-toggle.dark .toggle-indicator {
          transform: translateX(26px);
          background: #192a3a;
          color: #ffda85;
        }
        
        /* Hover y focus */
        .theme-toggle:hover .toggle-track {
          filter: brightness(1.1);
        }
        
        .theme-toggle:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </button>
  );
}

// Componente para el ícono del sol
function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Componente para el ícono de la luna
function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}