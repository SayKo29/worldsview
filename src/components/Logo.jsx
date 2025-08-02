import React from 'react';

export default function Logo() {
  return (
    <a href="/" className="logo-link">
      <div className="logo-container">
        <img 
          alt="Blog Logo" 
          src="/assets/blog-photos/DSC07099-01.jpeg" 
          className="logo-image" 
        />
      </div>
      
      <style jsx="true">{`
        .logo-link {
          display: block;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
        
        .logo-link:hover {
          transform: scale(1.05);
        }
        
        .logo-container {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(var(--primary-color-rgb), 0.7);
          box-shadow: 0 2px 10px rgba(var(--primary-color-rgb), 0.3),
                      0 0 0 2px rgba(255, 255, 255, 0.2);
        }
        
        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .logo-link:hover .logo-image {
          transform: scale(1.15) rotate(5deg);
        }

        @media screen and (max-width: 520px) {
          .logo-container {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </a>
  );
}