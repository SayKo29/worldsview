import React, { useState, useEffect, useRef } from 'react';
import { supabase, fetchComments, addComment } from '../lib/supabase';

export default function ExpandableComments({ pagePath, resourceId, resourceType = 'post', layout = 'default' }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [theme, setTheme] = useState('');
  const subscriptionRef = useRef(null);
  
  useEffect(() => {
    // Recuperar el nombre del autor guardado anteriormente
    try {
      const savedAuthorName = localStorage.getItem('commentAuthorName');
      if (savedAuthorName) {
        setAuthorName(savedAuthorName);
      }
    } catch (e) {
      console.error('Error al recuperar el nombre del autor:', e);
    }
    
    // Detectar el tema actual
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('theme-dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Detectar el tema inicial
    detectTheme();

    // Escuchar cambios en el tema
    const themeChangeHandler = (event) => {
      setTheme(event.detail?.theme || (document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light'));
    };

    document.addEventListener('themeChange', themeChangeHandler);
    
    // Cargar comentarios inmediatamente
    loadComments();
    
    // Cargar comentarios nuevamente después de un breve retraso para asegurar que todo esté inicializado
    const timer = setTimeout(() => {
      loadComments();
      
      // Suscribirse a cambios en los comentarios después de asegurar que todo esté cargado
      setupSubscription();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('themeChange', themeChangeHandler);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [pagePath, resourceId]);

  function setupSubscription() {
    // Limpiar suscripción anterior si existe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // Suscribirse a cambios en los comentarios
    subscriptionRef.current = supabase
      .channel(`comments-${resourceId || pagePath}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: resourceId ? `resource_id=eq.${resourceId}` : `page_path=eq.${pagePath}`
        }, 
        () => {
          loadComments();
        }
      )
      .subscribe();
  }

  async function loadComments() {
    try {
      setLoading(true);
      const loadedComments = await fetchComments(pagePath, resourceId);
      setComments(loadedComments);
      setCommentCount(loadedComments.length);
    } catch (e) {
      setError('Error al cargar los comentarios');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function toggleComments() {
    setExpanded(!expanded);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Guardar el nombre del autor para futuros comentarios
      try {
        localStorage.setItem('commentAuthorName', authorName);
      } catch (e) {
        console.error('Error al guardar el nombre del autor:', e);
      }
      
      const result = await addComment(newComment, authorName, pagePath, resourceId, resourceType);
      
      if (result) {
        setNewComment('');
        await loadComments();
      }
    } catch (e) {
      setError('Error al añadir el comentario');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function getDisplayName(comment) {
    if (comment.profile?.username) {
      return comment.profile.username;
    } else if (comment.author_name) {
      return comment.author_name;
    } else {
      return 'Anónimo';
    }
  }

  function getInitials(name) {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
  }

  function getAvatarColor(name) {
    if (!name) return 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'; // Default gradient
    
    // Generar un hash basado en el nombre
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Usar el hash para crear un color base (hue entre 0-359)
    const hue = hash % 360;
    
    // Crear un gradiente con colores relacionados
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 40) % 360}, 80%, 40%) 100%)`;
  }

  // SVGs definidos como constantes para mayor claridad
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const CommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  const ChevronIcon = () => (
    <svg className={`chevron ${expanded ? 'rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  if (layout === 'instagram') {
    return (
      <div className="instagram-comments">
        <div className={`comments-panel-instagram ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
          {error && (
            <div className="error-message">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}
          
          <div className="comments-list-container-instagram">
            <h3>Comentarios ({commentCount})</h3>
            
            {comments.length === 0 ? (
              <p className="no-comments">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
            ) : (
              <ul className="comments-list">
                {comments.map((comment) => (
                  <li key={comment.id} className="comment">
                    <div className="comment-header">
                      <div className="user-info">
                        <div className="user-avatar" style={{background: getAvatarColor(getDisplayName(comment))}}>
                          <UserIcon />
                        </div>
                        <strong>{getDisplayName(comment)}</strong>
                      </div>
                      <div className="comment-date">{formatDate(comment.created_at)}</div>
                    </div>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="comment-form-instagram">
            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <input
                  id={`author-name-${resourceId}`}
                  type="text"
                  placeholder="Tu nombre"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  id={`comment-content-${resourceId}`}
                  placeholder="Escribe tu comentario aquí..."
                  rows="2"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={loading || !newComment.trim() || !authorName.trim()} className="submit-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <div className={`comment-trigger ${expanded ? 'active' : ''}`}>
        <button 
          className={`comment-button ${theme}`}
          onClick={toggleComments}
          aria-expanded={expanded}
          aria-label={expanded ? "Ocultar comentarios" : "Mostrar comentarios"}
        >
          <div className="button-content">
            <CommentIcon />
            <span>{loading ? '...' : commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}</span>
          </div>
          <ChevronIcon />
        </button>
      </div>
      
      {expanded && (
        <div className={`comments-panel ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
          {error && (
            <div className="error-message">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}
          
          <div className="comment-form">
            <h3>Deja tu comentario</h3>
            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <label htmlFor={`author-name-${resourceId}`}>Tu nombre</label>
                <input
                  id={`author-name-${resourceId}`}
                  type="text"
                  placeholder="Tu nombre"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`comment-content-${resourceId}`}>Comentario</label>
                <textarea
                  id={`comment-content-${resourceId}`}
                  placeholder="Escribe tu comentario aquí..."
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={loading || !newComment.trim() || !authorName.trim()} className="submit-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar comentario</span>
                )}
              </button>
            </form>
          </div>
          
          <div className="comments-list-container">
            <h3>Comentarios ({commentCount})</h3>
            
            {comments.length === 0 ? (
              <p className="no-comments">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
            ) : (
              <ul className="comments-list">
                {comments.map((comment) => (
                  <li key={comment.id} className="comment">
                    <div className="comment-header">
                      <div className="user-info">
                        <div className="user-avatar" style={{background: getAvatarColor(getDisplayName(comment))}}>
                          <UserIcon />
                        </div>
                        <strong>{getDisplayName(comment)}</strong>
                      </div>
                      <div className="comment-date">{formatDate(comment.created_at)}</div>
                    </div>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .comments-container {
          position: relative;
          margin-top: 0.5rem;
        }
        
        .comment-trigger {
          position: relative;
          display: inline-block;
          z-index: 2;
        }
        
        .comment-trigger.active .comment-button {
          background-color: var(--primary-color, #e67e22);
          color: white;
        }
        
        .comment-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          background-color: rgba(255, 255, 255, 0.2);
          color: var(--text-main, #333);
          border: none;
          border-radius: 20px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-width: 130px;
        }
        
        .comment-button:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        
        .comment-button.dark {
          color: var(--text-main, #fff);
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .comment-button.dark:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
        
        .comment-trigger.active .comment-button:hover {
          background-color: var(--primary-color-dark, #d35400);
        }
        
        .button-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .chevron {
          transition: transform 0.3s ease;
        }
        
        .chevron.rotated {
          transform: rotate(180deg);
        }
        
        .comments-panel {
          position: relative;
          margin-top: 1rem;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }
        
        /* Tema oscuro por defecto */
        .comments-panel.dark-theme {
          background-color: rgba(42, 42, 42, 0.9);
          border: 1px solid #444;
          color: #f0f0f0;
        }
        
        /* Tema claro */
        .comments-panel.light-theme {
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #e0e0e0;
          color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Estilos del formulario para tema oscuro */
        .dark-theme .comment-form {
          margin-bottom: 2rem;
          background-color: rgba(51, 51, 51, 0.8);
          padding: 1.25rem;
          border-radius: 6px;
          border: 1px solid #444;
        }
        
        /* Estilos del formulario para tema claro */
        .light-theme .comment-form {
          margin-bottom: 2rem;
          background-color: rgba(249, 249, 249, 0.8);
          padding: 1.25rem;
          border-radius: 6px;
          border: 1px solid #eaeaea;
        }
        
        /* Títulos para tema oscuro */
        .dark-theme h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #f0f0f0;
          font-weight: 600;
        }
        
        /* Títulos para tema claro */
        .light-theme h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 600;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        /* Labels para tema oscuro */
        .dark-theme label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #ccc;
          font-size: 0.9rem;
        }
        
        /* Labels para tema claro */
        .light-theme label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
          font-size: 0.9rem;
        }
        
        /* Inputs y textareas para tema oscuro */
        .dark-theme input,
        .dark-theme textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #555;
          border-radius: 4px;
          background-color: rgba(34, 34, 34, 0.8);
          color: #f0f0f0;
          font-size: 0.95rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* Inputs y textareas para tema claro */
        .light-theme input,
        .light-theme textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.8);
          color: #333;
          font-size: 0.95rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* Focus para inputs y textareas */
        .dark-theme input:focus,
        .dark-theme textarea:focus,
        .light-theme input:focus,
        .light-theme textarea:focus {
          border-color: var(--primary-color, #e67e22);
          outline: none;
          box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.3);
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background-color: var(--primary-color, #e67e22);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          font-size: 0.95rem;
        }
        
        .submit-btn:hover:not(:disabled) {
          background-color: var(--primary-color-dark, #d35400);
          transform: translateY(-1px);
        }
        
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Loading spinner */
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Lista de comentarios */
        .comments-list-container {
          margin-top: 1rem;
        }
        
        .comments-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.8rem; /* Aumentar separación entre comentarios */
        }
        
        /* Comentarios para tema oscuro */
        .dark-theme .comment {
          padding: 1.25rem;
          background-color: rgba(51, 51, 51, 0.8);
          border-radius: 8px; /* Bordes más redondeados */
          border-left: 3px solid var(--primary-color, #e67e22);
          position: relative;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
        }
        
        /* Comentarios para tema claro */
        .light-theme .comment {
          padding: 1.25rem;
          background-color: rgba(249, 249, 249, 0.8);
          border-radius: 8px; /* Bordes más redondeados */
          border-left: 3px solid var(--primary-color, #e67e22);
          position: relative;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1); /* Sombra más pronunciada */
        }
        
        /* Línea separadora para tema oscuro */
        .dark-theme .comment::after {
          content: '';
          position: absolute;
          bottom: -0.9rem;
          left: 5%;
          right: 5%;
          height: 2px; /* Línea más gruesa */
          background: linear-gradient(90deg, transparent, rgba(230, 126, 34, 0.4), transparent); /* Mayor opacidad */
        }
        
        /* Línea separadora para tema claro */
        .light-theme .comment::after {
          content: '';
          position: absolute;
          bottom: -0.9rem;
          left: 5%;
          right: 5%;
          height: 2px; /* Línea más gruesa */
          background: linear-gradient(90deg, transparent, rgba(230, 126, 34, 0.4), transparent); /* Mayor opacidad */
        }
        
        .comment:last-child::after {
          display: none;
        }
        
        /* Header de comentario para tema oscuro */
        .dark-theme .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem; /* Más espacio después del header */
          border-bottom: 1px solid rgba(230, 126, 34, 0.25); /* Borde más visible */
          padding-bottom: 0.75rem; /* Más padding abajo */
        }
        
        /* Header de comentario para tema claro */
        .light-theme .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem; /* Más espacio después del header */
          border-bottom: 1px solid rgba(230, 126, 34, 0.25); /* Borde más visible */
          padding-bottom: 0.75rem; /* Más padding abajo */
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem; /* Más espacio entre avatar y nombre */
        }
        
        .user-avatar {
          width: 38px; /* Avatar más grande */
          height: 38px;
          background: linear-gradient(135deg, var(--primary-color, #e67e22) 0%, var(--primary-color-dark, #d35400) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.95rem;
          flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25); /* Sombra para el avatar */
        }
        
        /* Nombre de usuario para tema oscuro */
        .dark-theme .user-info strong {
          color: #f0f0f0;
          font-size: 1.1rem; /* Nombre más grande */
          font-weight: 700; /* Nombre más negrita */
          letter-spacing: 0.01em;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }
        
        /* Nombre de usuario para tema claro */
        .light-theme .user-info strong {
          color: #222;
          font-size: 1.1rem; /* Nombre más grande */
          font-weight: 700; /* Nombre más negrita */
          letter-spacing: 0.01em;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
        }
        
        /* Fecha de comentario para tema oscuro */
        .dark-theme .comment-date {
          font-size: 0.8rem;
          color: #aaa;
          background: rgba(255, 255, 255, 0.15); /* Fondo más visible */
          padding: 0.3rem 0.6rem; /* Más padding */
          border-radius: 12px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); /* Añadir sombra */
        }
        
        /* Fecha de comentario para tema claro */
        .light-theme .comment-date {
          font-size: 0.8rem;
          color: #666;
          background: rgba(230, 126, 34, 0.15); /* Fondo más visible */
          padding: 0.3rem 0.6rem; /* Más padding */
          border-radius: 12px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Añadir sombra */
        }
        
        /* Contenido de comentario para tema oscuro */
        .dark-theme .comment-content {
          color: #ddd;
          font-size: 0.95rem;
          line-height: 1.6; /* Más espacio entre líneas */
          white-space: pre-wrap;
          word-break: break-word;
          padding: 0.5rem 0; /* Más padding */
          margin-top: 0.25rem; /* Espacio adicional */
        }
        
        /* Contenido de comentario para tema claro */
        .light-theme .comment-content {
          color: #444;
          font-size: 0.95rem;
          line-height: 1.6; /* Más espacio entre líneas */
          white-space: pre-wrap;
          word-break: break-word;
          padding: 0.5rem 0; /* Más padding */
          margin-top: 0.25rem; /* Espacio adicional */
        }
        
        /* Mensaje de sin comentarios para tema oscuro */
        .dark-theme .no-comments {
          font-style: italic;
          color: #aaa;
          text-align: center;
          padding: 1.5rem;
          background-color: rgba(51, 51, 51, 0.8);
          border-radius: 6px;
          border: 1px dashed #555;
        }
        
        /* Mensaje de sin comentarios para tema claro */
        .light-theme .no-comments {
          font-style: italic;
          color: #777;
          text-align: center;
          padding: 1.5rem;
          background-color: rgba(249, 249, 249, 0.8);
          border-radius: 6px;
          border: 1px dashed #ddd;
        }
        
        /* Mensaje de error */
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e74c3c;
          padding: 0.75rem 1rem;
          background-color: rgba(231, 76, 60, 0.2);
          border-radius: 4px;
          margin-bottom: 1rem;
          border: 1px solid rgba(231, 76, 60, 0.3);
          font-size: 0.9rem;
        }
        
        /* Estilos layout Instagram */
        .instagram-comments {
          margin: 1rem 0;
        }
        
        /* Tema oscuro para layout Instagram */
        .comments-panel-instagram.dark-theme {
          background-color: rgba(42, 42, 42, 0.9);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          color: #f0f0f0;
          border: 1px solid #444;
        }
        
        /* Tema claro para layout Instagram */
        .comments-panel-instagram.light-theme {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #333;
          border: 1px solid #e0e0e0;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .comments-panel, .comments-panel-instagram {
            padding: 1rem;
          }
          
          .comment-form, .comment-form-instagram {
            padding: 1rem;
          }
          
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}