import React, { useEffect, useState, useRef } from 'react';
import { supabase, fetchComments, addComment } from '../lib/supabase';

export default function Comments({ pagePath, resourceId, resourceType = 'post' }) {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const commentFormRef = useRef(null);
  const commentsListRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Cargar comentarios iniciales
    loadComments();
    
    // Configurar suscripción a cambios
    setupSubscription();
    
    return () => {
      // Limpiar suscripción al desmontar
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [pagePath, resourceId]);

  async function loadComments() {
    try {
      setLoading(true);
      const loadedComments = await fetchComments(pagePath, resourceId);
      setComments(loadedComments);
      setCommentCount(loadedComments.length);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  }

  function setupSubscription() {
    const channelName = `comments-${resourceId || pagePath}`;
    
    // Limpiar suscripción anterior si existe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    subscriptionRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'comments',
            filter: resourceId ? `resource_id=eq.${resourceId}` : `page_path=eq.${pagePath}`
          }, 
          () => {
            // Recargar comentarios cuando haya cambios
            loadComments();
          }
      )
      .subscribe();
  }

  function toggleComments() {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    if (newExpanded) {
      // Si acabamos de mostrar el panel, cargar comentarios frescos
      loadComments();
    }
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.comment-submit-btn');
    
    if (submitBtn) {
      // Deshabilitar botón y mostrar estado de carga
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Enviando...';
      
      const authorInput = form.querySelector('input[name="author"]');
      const contentInput = form.querySelector('textarea[name="content"]');
      
      if (authorInput && contentInput && authorInput.value.trim() && contentInput.value.trim()) {
        try {
          // Guardar nombre para futuros comentarios
          localStorage.setItem('commentAuthorName', authorInput.value);
          
          // Enviar comentario
          const newComment = await addComment(
            contentInput.value,
            authorInput.value,
            pagePath,
            resourceId,
            resourceType
          );
          
          if (newComment) {
            // Recargar comentarios para mostrar el nuevo
            await loadComments();
            // Limpiar el textarea
            contentInput.value = '';
          }
        } catch (error) {
          console.error('Error al enviar comentario:', error);
          alert('No se pudo enviar el comentario. Por favor, inténtalo de nuevo.');
        } finally {
          // Restaurar botón
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    }
  }

  useEffect(() => {
    // Precargar nombre si existe en localStorage
    const authorInput = commentFormRef.current?.querySelector('input[name="author"]');
    if (authorInput) {
      const savedName = localStorage.getItem('commentAuthorName');
      if (savedName) authorInput.value = savedName;
    }
  }, [expanded]);

  return (
    <section className="comments-container" data-path={pagePath} data-resource-id={resourceId} data-resource-type={resourceType}>
      <h2>Comentarios</h2>
      
      {/* Contador de comentarios visible */}
      <div className="comment-counter">
        <span className="comment-count">{commentCount}</span> {commentCount === 1 ? 'comentario' : 'comentarios'}
      </div>
      
      {/* Botón para expandir/contraer los comentarios */}
      <div className="comment-trigger">
        <button 
          className="comment-button" 
          aria-expanded={expanded}
          onClick={toggleComments}
        >
          <div className="button-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Ver comentarios</span>
          </div>
          <svg className={`chevron ${expanded ? 'rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      
      {/* Panel de comentarios (inicialmente oculto) */}
      {expanded && (
        <div className="comments-panel">
          {/* Lista de comentarios */}
          <div className="comments-list-container" ref={commentsListRef}>
            <h3>Comentarios ({commentCount})</h3>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
              ) : (
                comments.map(comment => (
                  <div className="comment" key={comment.id}>
                    <div className="comment-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <strong>{comment.author_name || (comment.profile && comment.profile.username) || 'Usuario anónimo'}</strong>
                      </div>
                      <div className="comment-date">{new Date(comment.created_at).toLocaleString('es-ES')}</div>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Formulario para añadir comentarios */}
          <div className="comment-form">
            <h4>Deja tu comentario</h4>
            <form ref={commentFormRef} onSubmit={handleSubmitComment}>
              <div className="form-group">
                <label htmlFor="author-name">Tu nombre</label>
                <input type="text" id="author-name" name="author" placeholder="Tu nombre" required />
              </div>
              <div className="form-group">
                <label htmlFor="comment-content">Comentario</label>
                <textarea id="comment-content" name="content" placeholder="Escribe tu comentario aquí..." rows="3" required></textarea>
              </div>
              <button type="submit" className="comment-submit-btn">Enviar comentario</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .comments-container {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }
        
        .comments-container h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          text-align: center;
        }
        
        .comment-counter {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #666;
        }
        
        .comment-count {
          font-weight: bold;
          margin-right: 0.25rem;
          color: #333;
        }
        
        .comment-trigger {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .comment-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          background-color: #f0f0f0;
          color: #333;
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
          background-color: #e0e0e0;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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
          margin-top: 1rem;
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .comments-list-container h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #333;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 0.75rem;
          font-weight: 600;
        }
        
        .comments-list {
          padding: 0.5rem 0;
        }
        
        .no-comments, .error-comments {
          font-style: normal;
          color: #666;
          text-align: center;
          padding: 1.5rem;
          background: #f8f8f8;
          border-radius: 4px;
          margin: 0.5rem 0;
        }
        
        .error-comments {
          color: #721c24;
          background-color: #f8d7da;
        }
        
        .comment {
          padding: 1rem;
          background: #fff;
          border-radius: 4px;
          border-left: 2px solid #ccc;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .comment:last-child {
          margin-bottom: 0;
        }
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          flex-shrink: 0;
          border: 1px solid #e0e0e0;
        }
        
        .user-avatar svg {
          width: 16px;
          height: 16px;
          stroke: #555;
        }
        
        .user-info strong {
          color: #333;
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        .comment-date {
          font-size: 0.75rem;
          color: #777;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          background: #f5f5f5;
        }
        
        .comment-content {
          color: #333;
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          padding: 0.25rem 0;
        }
        
        .comment-form {
          margin-top: 2rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }
        
        .comment-form h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #333;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .form-group {
          margin-bottom: 0.75rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
          color: #555;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          color: #333;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }
        
        .form-group input:hover,
        .form-group textarea:hover {
          border-color: #aaa;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #4a6fa5;
          outline: none;
          box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
        }
        
        .comment-submit-btn {
          background-color: #4a6fa5;
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.2s ease;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        
        .comment-submit-btn:hover:not(:disabled) {
          background-color: #3a5a8c;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .comment-submit-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        
        /* Loading spinner con mejor visibilidad */
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Modo oscuro - adaptado para React */
        @media (prefers-color-scheme: dark) {
          .comment {
            background: #222;
            border-left: 2px solid #444;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }
          
          .comment-header {
            border-color: #333;
          }
          
          .user-avatar {
            background: #333;
            border-color: #444;
          }
          
          .user-avatar svg {
            stroke: #bbb;
          }
          
          .user-info strong {
            color: #eee;
          }
          
          .comment-date {
            background: #333;
            color: #bbb;
          }
          
          .comment-content {
            color: #ddd;
          }
          
          .comments-panel {
            background: #1a1a1a;
            border: 1px solid #333;
          }
          
          .comments-container h3 {
            border-color: #333;
            color: #eee;
          }
          
          .no-comments,
          .loading-comments {
            background: #292929;
            color: #bbb;
          }
          
          .error-comments {
            background: #382424;
            color: #e6aaaa;
          }
          
          .comment-form {
            background: #292929;
            border-color: #444;
          }
          
          .comment-form h4 {
            color: #eee;
            border-color: #444;
          }
          
          .form-group label {
            color: #bbb;
          }
          
          .form-group input,
          .form-group textarea {
            background: #333;
            border-color: #555;
            color: #eee;
          }
          
          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #4a6fa5;
            box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.25);
          }
          
          .comment-button {
            background-color: #333;
            color: #eee;
          }
          
          .comment-button:hover {
            background-color: #444;
          }
          
          .comment-counter {
            color: #aaa;
          }
          
          .comment-count {
            color: #eee;
          }
        }
      `}</style>
    </section>
  );
}