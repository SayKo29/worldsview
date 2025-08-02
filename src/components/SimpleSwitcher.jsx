import React, { useState, useEffect } from 'react';

/**
 * Un componente interruptor de tema simple que manipula directamente el DOM
 * para asegurar que el cambio de tema sea inmediato y consistente.
 */
export default function SimpleSwitcher() {
  // Estado local para el tema actual
  const [isDark, setIsDark] = useState(false);
  
  // Inicializar el tema al cargar
  useEffect(() => {
    // Inicialización del tema
    const initTheme = () => {
      try {
        // Verificar el tema actual
        const isDarkMode = document.documentElement.classList.contains('theme-dark') || 
                          (localStorage.getItem('theme') === 'dark') || 
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Actualizar estado
        setIsDark(isDarkMode);
        
        console.log(`[SimpleSwitcher] Tema inicial detectado: ${isDarkMode ? 'oscuro' : 'claro'}`);
      } catch (e) {
        console.error('[SimpleSwitcher] Error en inicialización:', e);
      }
    };
    
    // Ejecutar inicialización
    initTheme();
    
    // Listener para sincronizar con cambios en localStorage (para múltiples pestañas)
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const newIsDark = e.newValue === 'dark';
        setIsDark(newIsDark);
      }
    };
    
    // Añadir listener para eventos de storage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // Limpiar listener al desmontar
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Función para aplicar el tema al DOM
  const applyTheme = (dark) => {
    try {
      console.log(`[SimpleSwitcher] Aplicando tema: ${dark ? 'oscuro' : 'claro'}`);
      
      // 1. Cambiar clases en documentElement
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(dark ? 'theme-dark' : 'theme-light');
      
      // 2. Establecer atributo data-theme
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      
      // 3. Guardar en localStorage
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      
      // 4. Cambiar color-scheme para scrollbars nativas
      document.body.style.colorScheme = dark ? 'dark' : 'light';
      
      // 5. Disparar evento personalizado para otros componentes
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: dark ? 'dark' : 'light' }
      }));
    } catch (e) {
      console.error('[SimpleSwitcher] Error al aplicar tema:', e);
    }
  };
  
  // Cambiar el tema al hacer clic
  const toggleTheme = () => {
    try {
      const newIsDark = !isDark;
      console.log(`[SimpleSwitcher] Cambiando tema a: ${newIsDark ? 'oscuro' : 'claro'}`);
      
      // Actualizar estado y aplicar tema
      setIsDark(newIsDark);
      applyTheme(newIsDark);
    } catch (e) {
      console.error('[SimpleSwitcher] Error al cambiar tema:', e);
    }
  };
  
  return (
    <button 
      className="theme-switcher"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <div className={`switch ${isDark ? 'dark' : 'light'}`}>
        <div className="switch-track">
          <span className="icon sun">☀️</span>
          <span className="icon moon">🌙</span>
        </div>
        <div className="switch-handle"></div>
      </div>
      
      <style jsx="true">{`
        .theme-switcher {
          cursor: pointer;
          padding: 5px;
          background: transparent;
          border: none;
          outline: none;
          border-radius: 50px;
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        
        .theme-switcher:hover {
          transform: scale(1.05);
        }
        
        .theme-switcher:active {
          transform: scale(0.95);
        }
        
        .switch {
          position: relative;
          width: 60px;
          height: 30px;
          border-radius: 30px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2), 
                      inset 0 1px 1px rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        
        .switch-track {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5px;
          background: ${isDark ? 
            'linear-gradient(to right, #0f2027, #203a43, #2c5364)' :
            'linear-gradient(to right, #ff9966, #ff5e62)'};
          transition: background 0.3s ease;
          z-index: 1;
        }
        
        .icon {
          font-size: 14px;
          line-height: 1;
          z-index: 2;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }
        
        .switch-handle {
          position: absolute;
          top: 2px;
          ${isDark ? 'right: 2px' : 'left: 2px'};
          width: 26px;
          height: 26px;
          background-color: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          z-index: 3;
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55),
                      right 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55),
                      left 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55),
                      background-color 0.3s ease;
        }
        
        .switch.dark .switch-handle {
          background-color: #f0f0f0;
        }
      `}</style>
    </button>
  );
}