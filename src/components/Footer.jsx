import React from 'react';

export default function Footer() {
  return (
    <footer>
      <span>
        &copy; {new Date().getFullYear()}
        Hecho con ❤️ por Andrea Solsona
      </span>
      
      <style jsx="true">{`
        footer {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 1em auto;
          max-width: 1400px;
          padding: 1em 2em;
          text-align: center;
          width: 100%;
          background: rgba(254, 247, 230, 0.1);
          backdrop-filter: blur(15px) saturate(160%);
          -webkit-backdrop-filter: blur(15px) saturate(160%);
          border: 1px solid rgba(230, 126, 34, 0.15);
          border-radius: 12px;
          box-shadow: 
            0 4px 20px rgba(139, 69, 19, 0.08),
            inset 0 1px 0 rgba(254, 247, 230, 0.2);
        }
        
        @media (prefers-color-scheme: dark) {
          footer {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }
        }
        
        @media screen and (max-width: 520px) {
          footer {
            padding: 0.8em 1em;
            margin: 15px auto;
            width: calc(100% - 30px);
            border-radius: 10px;
            font-size: 0.9rem;
          }
        }
        
        @media screen and (max-width: 360px) {
          footer {
            margin: 12px auto;
            width: calc(100% - 24px);
            padding: 0.7em 0.8em;
          }
        }
      `}</style>
    </footer>
  );
}