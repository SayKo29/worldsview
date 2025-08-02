import React, { useEffect, useState, useRef } from 'react';

/**
 * Componente para optimizar imágenes con carga diferida, precargas y técnica blur-up
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  loadingMode = 'lazy',
  transitionName = '',
  quality = 85,
  placeholder = 'blur'
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const placeholderSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '-placeholder.jpg');
  
  // Detectar si la imagen está en viewport con IntersectionObserver
  useEffect(() => {
    if (!imgRef.current || loadingMode === 'eager') {
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Precargar la imagen cuando entre en el viewport
          const img = new Image();
          img.src = src;
          img.onload = () => setLoaded(true);
          img.onerror = () => setError(true);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px', // Precargar antes de que esté completamente visible
    });
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, loadingMode]);
  
  // Generar atributos de altura/anchura
  const sizeAttrs = {};
  if (width) sizeAttrs.width = width;
  if (height) sizeAttrs.height = height;
  
  // Generar atributos para View Transitions API
  const transitionAttrs = {};
  if (transitionName) {
    transitionAttrs['transition:name'] = transitionName;
  }
  
  // Estilo para el contenedor
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', // Fondo para mientras carga
    display: 'block',
    width: '100%',
    height: '100%',
  };
  
  // Estilo para las imágenes
  const imageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'opacity 0.3s ease-in-out',
  };
  
  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`} 
      style={containerStyle}
      {...transitionAttrs}
    >
      {/* Placeholder de baja resolución */}
      {placeholder === 'blur' && !loaded && !error && (
        <div 
          className="placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#eee',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Imagen principal */}
      <img 
        src={src}
        alt={alt}
        loading={loadingMode}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          ...imageStyle,
          opacity: loaded ? 1 : 0,
        }}
        decoding="async"
        {...sizeAttrs}
        {...transitionAttrs}
      />
      
      {/* Indicador de error */}
      {error && (
        <div 
          className="error-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8d7da',
            color: '#721c24',
          }}
        >
          <span>Error al cargar la imagen</span>
        </div>
      )}
    </div>
  );
}