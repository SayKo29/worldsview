import React from 'react';

export default function Logo() {
  return (
    <a href="/">
      <img alt="Blog Logo" src="/assets/logo.webp" width="75" height="50" />
      
      <style jsx="true">{`
        img {
          display: block;
          width: 75px;
        }

        @media screen and (max-width: 520px) {
          img {
            display: none;
          }
        }
      `}</style>
    </a>
  );
}