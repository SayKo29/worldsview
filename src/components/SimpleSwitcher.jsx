import React, { useState, useEffect } from 'react';

/**
 * Un componente interruptor de tema ultra simple que funciona directamente
 * sin dependencias ni complicaciones.
 */
export default function SimpleSwitcher() {
  // Estado local para el tema actual
  const [isDark, setIsDark] = useState(false);
  
  // Inicializar el tema al cargar
  useEffect(() => {
    // Función para detectar si está en modo oscuro
    const checkDarkMode = () => {
      // Prioridad 1: Clases en HTML
      if (document.documentElement.classList.contains('theme-dark')) {
        return true;
      }
      
      // Prioridad 2: localStorage
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') return true;
        if (saved === 'light') return false;
      } catch (e) {
        console.error('Error al leer tema de localStorage', e);
      }
      
      // Prioridad 3: Preferencia del sistema
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    
    // Establecer el estado inicial
    setIsDark(checkDarkMode());
    
    // Imprimir estado para depuración
    console.log(`Tema inicial: ${checkDarkMode() ? 'oscuro' : 'claro'}`);
    
    // Aplicar tema inmediatamente (para asegurar coherencia)
    applyTheme(checkDarkMode());
  }, []);
  
  // Función para aplicar el tema al DOM
  const applyTheme = (dark) => {
    console.log(`Aplicando tema: ${dark ? 'oscuro' : 'claro'}`);
    
    try {
      // 1. Cambiar clases en documentElement
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(dark ? 'theme-dark' : 'theme-light');
      
      // 2. Establecer atributo data-theme
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      
      // 3. Guardar en localStorage
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      
      // Imprimir clases para depuración
      console.log('Classes:', document.documentElement.className);
    } catch (e) {
      console.error('Error al aplicar tema:', e);
    }
  };
  
  // Cambiar el tema al hacer clic
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
    console.log(`Tema cambiado a: ${newIsDark ? 'oscuro' : 'claro'}`);
  };
  
  return (
    <div className="theme-switcher" onClick={toggleTheme}>
      <div className={`switch ${isDark ? 'dark' : 'light'}`}>
        <div className="switch-handle">
          {isDark ? (
            <span role="img" aria-label="sol">☀️</span>
          ) : (
            <span role="img" aria-label="luna">🌙</span>
          )}
        </div>
      </div>
      
      <style jsx="true">{`
        .theme-switcher {
          cursor: pointer;
          padding: 5px;
        }
        
        .switch {
          position: relative;
          width: 60px;
          height: 30px;
          background: ${isDark ? 
            'linear-gradient(to right, #0f2027, #203a43, #2c5364)' :
            'linear-gradient(to right, #ff9966, #ff5e62)'};
          border-radius: 30px;
          padding: 2px;
          transition: all 0.3s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2),
                      inset 0 1px 1px rgba(255,255,255,0.2);
        }
        
        .switch.dark {
          box-shadow: 0 2px 5px rgba(0,0,0,0.2),
                      inset 0 1px 1px rgba(255,255,255,0.1);
        }
        
        .switch-handle {
          width: 26px;
          height: 26px;
          background-color: ${isDark ? '#192a3a' : 'white'};
          border-radius: 50%;
          transform: translateX(${isDark ? '30px' : '0'});
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55), 
                      background-color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        
        .switch-handle span {
          font-size: 16px;
          line-height: 1;
        }
        
        /* Efecto hover */
        .theme-switcher:hover .switch {
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
}