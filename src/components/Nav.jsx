import React from 'react';
import SimpleSwitcher from './SimpleSwitcher';

export default function Nav({ current = '' }) {
  return (
    <nav>
      <a className={current === "home" ? "selected" : ""} href='/'>Blog</a>
      <a className={current === "fotos" ? "selected" : ""} href='/fotos'>Fotos</a>
      <div className="theme-toggle-container">
        <SimpleSwitcher />
      </div>
      
      <style jsx="true">{`
        nav {
          align-items: center;
          display: flex;
          flex: 1;
          font-family: var(--font-family-main);
          font-weight: 400;
          font-size: 1.8rem;
          justify-content: center;
          text-transform: uppercase;
          position: relative;
          padding-right: 80px;
        }

        a {
          color: inherit;
          text-decoration: none;
          padding: 10px 18px;
          margin: 0 12px;
          min-width: 90px;
          text-align: center;
          font-size: 1.8rem;
          position: relative;
          transition: all 0.3s ease;
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* Estilo retro años 80 */
        a:not(.selected) {
          opacity: 0.85;
          transform: translateY(0);
        }
        
        /* Efecto hover elevación con brillo retro */
        a:hover {
          opacity: 1;
          transform: translateY(-3px);
          box-shadow: 
            0 8px 16px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            0 0 20px rgba(232, 152, 76, 0.3);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
        }
        
        /* Botón seleccionado - estilo retro */
        .selected {
          background: linear-gradient(180deg, rgba(var(--primary-color-rgb, 230, 126, 34), 0.3) 0%, 
                                               rgba(var(--primary-color-rgb, 230, 126, 34), 0.15) 100%);
          border: 1px solid rgba(var(--primary-color-rgb, 230, 126, 34), 0.4);
          box-shadow: 
            0 6px 12px rgba(var(--primary-color-rgb, 230, 126, 34), 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            0 0 15px rgba(var(--primary-color-rgb, 230, 126, 34), 0.3);
          transform: translateY(-2px);
          opacity: 1;
        }
        
        /* Efecto de brillo neón en los bordes - estilo años 80 */
        a::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(90deg, 
                      rgba(var(--accent-color-rgb, 243, 156, 18), 0.5),
                      rgba(var(--primary-color-rgb, 230, 126, 34), 0.5));
          border-radius: 8px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        a:hover::after {
          opacity: 0.6;
        }
        
        .selected::after {
          opacity: 0.8;
        }

        .theme-toggle-container {
          position: absolute;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media screen and (max-width: 1020px) {
          nav {
            font-size: 1.4rem;
            padding-right: 70px;
          }
          
          a {
            font-size: 1.4rem;
            padding: 8px 15px;
            margin: 0 10px;
            min-width: 80px;
          }
          
          .theme-toggle-container {
            right: 8px;
          }
        }

        @media screen and (max-width: 520px) {
          nav {
            justify-content: center;
            font-size: 1.1rem;
            gap: 0.5rem;
            padding-right: 60px;
          }
          
          .theme-toggle-container {
            position: absolute;
            right: 5px;
          }
          
          a {
            margin: 0 5px;
            padding: 6px 10px;
            font-size: 1.1rem;
            min-width: 50px;
          }
        }

        @media screen and (max-width: 380px) {
          nav {
            font-size: 1rem;
            gap: 0.3rem;
            padding-right: 50px;
          }
          
          a {
            margin: 0 3px;
            padding: 5px 8px;
            font-size: 1rem;
            min-width: 45px;
          }
          
          .theme-toggle-container {
            right: 3px;
          }
        }
      `}</style>
    </nav>
  );
}