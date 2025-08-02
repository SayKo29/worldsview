import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';

export default function Nav({ current = '' }) {
  return (
    <nav>
      <a className={current === "home" ? "selected" : ""} href='/'>Blog</a>
      <a className={current === "fotos" ? "selected" : ""} href='/fotos'>Fotos</a>
      <div className="theme-toggle-container">
        <ThemeToggleButton />
      </div>
      
      <style jsx>{`
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
          padding: 15px 20px;
          display: block;
          position: relative;
          margin: 0 15px;
          min-width: 90px;
          text-align: center;
          font-size: 1.8rem;
        }

        a:not(.selected) {
          opacity: 0.7;
        }

        a::before {
          content: '';
          position: absolute;
          transition: transform .3s ease;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background: var(--text-secondary);
          transform: scaleX(0);
        }

        a:hover::before,
        .selected::before {
          transform: scaleX(1);
        }

        .selected::before {
          background: var(--primary-color);
        }

        .theme-toggle-container {
          position: absolute;
          right: 10px;
          width: 60px;
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
            padding: 12px 15px;
            margin: 0 10px;
            min-width: 80px;
          }
          
          .theme-toggle-container {
            width: 50px;
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
            width: 45px;
          }
          
          a {
            margin: 0 3px;
            padding: 8px 6px;
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
            margin: 0 2px;
            padding: 6px 4px;
            font-size: 1rem;
            min-width: 45px;
          }
          
          .theme-toggle-container {
            width: 40px;
            right: 3px;
          }
        }
      `}</style>
    </nav>
  );
}