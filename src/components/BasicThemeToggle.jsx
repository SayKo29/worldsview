import React, { useState, useEffect } from 'react';

// Componente simplificado de cambio de tema (sin dependencias complejas)
export default function BasicThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  // Inicializar el tema
  useEffect(() => {
    // Detectar el tema actual
    const detectTheme = () => {
      try {
        // Intentar leer de localStorage primero
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
        
        // Si no hay tema guardado, usar preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (e) {
        console.error('Error accediendo al tema:', e);
      }
      
      return 'light';
    };
    
    // Establecer el tema inicial
    const theme = detectTheme();
    setCurrentTheme(theme);
    console.log('Tema inicial:', theme);
    
    // Escuchar cambios en el tema
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue === 'dark' ? 'dark' : 'light';
        setCurrentTheme(newTheme);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Manejar clic en el botón de cambio de tema
  const toggleTheme = () => {
    try {
      // Cambiar al tema opuesto
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Actualizar DOM
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${newTheme}`);
      
      // Guardar en localStorage
      localStorage.setItem('theme', newTheme);
      
      // Actualizar estado local
      setCurrentTheme(newTheme);
      
      console.log('Tema cambiado a:', newTheme);
    } catch (e) {
      console.error('Error cambiando tema:', e);
    }
  };
  
  return (
    <button 
      onClick={toggleTheme}
      className={`theme-toggle-button ${currentTheme}`}
      type="button"
    >
      {currentTheme === 'dark' ? '☀️' : '🌙'}
      
      <style jsx="true">{`
        .theme-toggle-button {
          background: ${currentTheme === 'dark' 
            ? 'linear-gradient(to right, #2c3e50, #4b6cb7)' 
            : 'linear-gradient(to right, #ff6b6b, #ffa742)'};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .theme-toggle-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .theme-toggle-button:active {
          transform: translateY(-1px);
        }
      `}</style>
    </button>
  );
}