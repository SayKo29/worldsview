import React from 'react';
import Logo from './Logo';
import Nav from './Nav';

export default function Header({ current = '' }) {
  const [theme, setTheme] = React.useState('light');
  
  // Detectar el tema actual y actualizarlo cuando cambie
  React.useEffect(() => {
    // Importar ThemeHandler dinámicamente para evitar errores de SSR
    import('../scripts/theme-handler').then((module) => {
      const ThemeHandler = module.default;
      
      // Función para detectar el tema actual
      const updateTheme = () => {
        const currentTheme = ThemeHandler.getTheme();
        setTheme(currentTheme);
      };
      
      // Detectar tema inicial
      updateTheme();
      
      // Escuchar cambios en el tema
      const handleThemeChange = () => {
        updateTheme();
      };
      
      // Suscribirse a eventos de cambio de tema
      window.addEventListener('themechange', handleThemeChange);
      
      return () => {
        window.removeEventListener('themechange', handleThemeChange);
      };
    });
  }, []);
  
  return (
    <header className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Logo />
      <Nav current={current} />
      
      <style jsx="true">{`
        header {
          display: flex;
          margin: 0 auto;
          max-width: 1400px;
          padding: 2em;
          width: 100%;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 16px;
          transition: background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease;
        }
        
        header.light-theme {
          background: rgba(254, 247, 230, 0.12);
          border: 1px solid rgba(230, 126, 34, 0.18);
          box-shadow: 
            0 8px 32px rgba(139, 69, 19, 0.12),
            inset 0 1px 0 rgba(254, 247, 230, 0.25);
        }
        
        header.dark-theme {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        @media screen and (max-width: 1020px) {
          header {
            padding: 1.5em;
          }
        }

        @media screen and (max-width: 520px) {
          header {
            padding: 0.8em 1em;
            margin: 15px auto;
            width: calc(100% - 30px);
            border-radius: 12px;
          }
        }

        @media screen and (max-width: 360px) {
          header {
            margin: 12px auto;
            width: calc(100% - 24px);
          }
        }
      `}</style>
    </header>
  );
}