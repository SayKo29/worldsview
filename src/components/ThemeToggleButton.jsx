import React, { useState, useEffect, useCallback } from 'react';

export default function ThemeToggleButton() {
  // Necesitamos que theme tenga un valor por defecto para evitar un renderizado "uncontrolled"
  const [theme, setTheme] = useState('light');
  
  // Función para detectar el tema actual del documento
  const detectCurrentTheme = useCallback(() => {
    // Primero verificar por clase en el elemento raíz
    const rootEl = document.documentElement;
    if (rootEl.classList.contains('theme-dark')) {
      return 'dark';
    }
    
    // Luego verificar localStorage
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme;
      }
    } catch (e) {
      console.error('Error accediendo a localStorage:', e);
    }
    
    // Comprobar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Valor por defecto
    return 'light';
  }, []);

  // Función para aplicar el tema
  const applyTheme = useCallback((selectedTheme) => {
    const rootEl = document.documentElement;
    
    if (selectedTheme === 'light') {
      rootEl.classList.remove('theme-dark');
      document.body.style.colorScheme = 'light';
    } else if (selectedTheme === 'dark') {
      rootEl.classList.add('theme-dark');
      document.body.style.colorScheme = 'dark';
    }
    
    // Guardar en localStorage
    try {
      localStorage.setItem('theme', selectedTheme);
    } catch (e) {
      console.error('Error al guardar tema en localStorage:', e);
    }
    
    // Evento personalizado para que otros componentes sepan del cambio
    document.dispatchEvent(
      new CustomEvent('themeChange', { detail: { theme: selectedTheme } })
    );
    
    console.log(`Tema aplicado: ${selectedTheme}`);
  }, []);

  // Inicialización del tema al cargar el componente
  useEffect(() => {
    const currentTheme = detectCurrentTheme();
    console.log('Tema inicial detectado:', currentTheme);
    
    // Actualizar el estado local
    setTheme(currentTheme);
    
    // Aplicar el tema (para asegurar que todo esté sincronizado)
    applyTheme(currentTheme);
    
    // Configurar el detector de cambios de preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Función que se ejecuta cuando cambia la preferencia del sistema
    const handleSystemThemeChange = (e) => {
      // Solo cambiar si no hay preferencia guardada
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log('Cambio detectado en preferencia del sistema:', newTheme);
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    // Suscribirse a cambios en la preferencia del sistema
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery?.addListener) {
      // Para Safari < 14
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    return () => {
      // Limpiar el listener
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [detectCurrentTheme, applyTheme]);

  // Manejador del cambio de tema mediante el toggle
  function handleThemeChange(event) {
    const newTheme = event.target.value;
    console.log('Usuario seleccionó tema:', newTheme);
    
    // Actualizar el estado
    setTheme(newTheme);
    
    // Aplicar el tema
    applyTheme(newTheme);
  }

  // Iconos para los temas
  const icons = [
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      key="light-icon"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>,
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      key="dark-icon"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>,
  ];

  const themes = ['light', 'dark'];

  return (
    <div className="theme-toggle">
      {themes.map((t, i) => (
        <label key={t} className={theme === t ? 'checked' : ''}>
          {icons[i]}
          <input
            type="radio"
            name="theme-toggle"
            checked={theme === t}
            value={t}
            title={`Usar tema ${t === 'light' ? 'claro' : 'oscuro'}`}
            aria-label={`Usar tema ${t === 'light' ? 'claro' : 'oscuro'}`}
            onChange={handleThemeChange}
          />
        </label>
      ))}
    </div>
  );
}