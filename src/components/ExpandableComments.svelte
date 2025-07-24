<script>
  import { onMount, onDestroy } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { supabase, fetchComments, addComment } from '../lib/supabase';
  
  export let pagePath;
  export let resourceId;
  export let resourceType;
  export let layout = 'default'; // 'default', 'instagram'
  
  let comments = [];
  let newComment = '';
  let authorName = '';
  let loading = false;
  let error = null;
  let expanded = false;
  let commentCount = 0;
  let subscription;
  
  onMount(async () => {
    // Recuperar el nombre del autor guardado anteriormente
    const savedAuthorName = localStorage.getItem('commentAuthorName');
    if (savedAuthorName) {
      authorName = savedAuthorName;
    }
    
    // Cargar comentarios para contar
    await loadComments();
    
    // Suscribirse a cambios en los comentarios
    subscription = supabase
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
  });
  
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
  
  async function loadComments() {
    try {
      loading = true;
      comments = await fetchComments(pagePath, resourceId);
      commentCount = comments.length;
    } catch (e) {
      error = 'Error al cargar los comentarios';
      console.error(e);
    } finally {
      loading = false;
    }
  }
  
  function toggleComments() {
    expanded = !expanded;
  }
  
  async function handleAddComment() {
    if (!newComment.trim() || !authorName.trim()) return;
    
    try {
      loading = true;
      error = null;
      
      // Guardar el nombre del autor para futuros comentarios
      localStorage.setItem('commentAuthorName', authorName);
      
      const result = await addComment(newComment, authorName, pagePath, resourceId, resourceType);
      
      if (result) {
        newComment = '';
        await loadComments();
      }
    } catch (e) {
      error = 'Error al añadir el comentario';
      console.error(e);
    } finally {
      loading = false;
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
</script>

{#if layout === 'instagram'}
  <div class="instagram-comments">
    <div class="comments-panel-instagram">
      {#if error}
        <div class="error-message" transition:fade>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      {/if}
      
      <div class="comments-list-container-instagram">
        <h3>Comentarios ({commentCount})</h3>
        
        {#if comments.length === 0}
          <p class="no-comments">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
        {:else}
          <ul class="comments-list">
            {#each comments as comment (comment.id)}
              <li class="comment" transition:fade={{ duration: 300 }}>
                <div class="comment-header">
                  <div class="user-info">
                    <strong>{getDisplayName(comment)}</strong>
                  </div>
                  <div class="comment-date">{formatDate(comment.created_at)}</div>
                </div>
                <div class="comment-content">
                  {comment.content}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      
      <div class="comment-form-instagram">
        <form on:submit|preventDefault={handleAddComment}>
          <div class="form-group">
            <input
              id="author-name-{resourceId}"
              type="text"
              placeholder="Tu nombre"
              bind:value={authorName}
              required
            />
          </div>
          <div class="form-group">
            <textarea
              id="comment-content-{resourceId}"
              placeholder="Escribe tu comentario aquí..."
              rows="2"
              bind:value={newComment}
              required
            ></textarea>
          </div>
          <button type="submit" disabled={loading || !newComment.trim() || !authorName.trim()} class="submit-btn">
            {#if loading}
              <span class="loading-spinner"></span>
              <span>Enviando...</span>
            {:else}
              <span>Enviar</span>
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
{:else}
  <div class="comments-container">
    <div class="comment-trigger" class:active={expanded}>
      <button 
        class="comment-button" 
        on:click={toggleComments}
        aria-expanded={expanded}
        aria-label={expanded ? "Ocultar comentarios" : "Mostrar comentarios"}
      >
        <div class="button-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{loading ? '...' : commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}</span>
        </div>
        <svg class="chevron" class:rotated={expanded} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    
    {#if expanded}
      <div 
        class="comments-panel"
        transition:slide={{ duration: 300, easing: cubicOut }}
      >
        {#if error}
          <div class="error-message" transition:fade>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        {/if}
        
        <div class="comment-form">
          <h3>Deja tu comentario</h3>
          <form on:submit|preventDefault={handleAddComment}>
            <div class="form-group">
              <label for="author-name-{resourceId}">Tu nombre</label>
              <input
                id="author-name-{resourceId}"
                type="text"
                placeholder="Tu nombre"
                bind:value={authorName}
                required
              />
            </div>
            <div class="form-group">
              <label for="comment-content-{resourceId}">Comentario</label>
              <textarea
                id="comment-content-{resourceId}"
                placeholder="Escribe tu comentario aquí..."
                rows="3"
                bind:value={newComment}
                required
              ></textarea>
            </div>
            <button type="submit" disabled={loading || !newComment.trim() || !authorName.trim()} class="submit-btn">
              {#if loading}
                <span class="loading-spinner"></span>
                <span>Enviando...</span>
              {:else}
                <span>Enviar comentario</span>
              {/if}
            </button>
          </form>
        </div>
        
        <div class="comments-list-container">
          <h3>Comentarios ({commentCount})</h3>
          
          {#if comments.length === 0}
            <p class="no-comments">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
          {:else}
            <ul class="comments-list">
              {#each comments as comment (comment.id)}
                <li class="comment" transition:fade={{ duration: 300 }}>
                  <div class="comment-header">
                    <div class="user-info">
                      <strong>{getDisplayName(comment)}</strong>
                    </div>
                    <div class="comment-date">{formatDate(comment.created_at)}</div>
                  </div>
                  <div class="comment-content">
                    {comment.content}
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
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
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1;
    border: 1px solid #444;
    color: #f0f0f0;
  }
  
  /* Estilos del formulario */
  .comment-form {
    margin-bottom: 2rem;
    background-color: #333;
    padding: 1.25rem;
    border-radius: 6px;
    border: 1px solid #444;
  }
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #f0f0f0;
    font-weight: 600;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #ccc;
    font-size: 0.9rem;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #555;
    border-radius: 4px;
    background-color: #222;
    color: #f0f0f0;
    font-size: 0.95rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  input:focus,
  textarea:focus {
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
    gap: 1rem;
  }
  
  .comment {
    padding: 1rem;
    background-color: #333;
    border-radius: 6px;
    border-left: 3px solid var(--primary-color, #e67e22);
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-info strong {
    color: #f0f0f0;
    font-size: 0.95rem;
  }
  
  .comment-date {
    font-size: 0.8rem;
    color: #aaa;
    margin-top: 0.25rem;
  }
  
  .comment-content {
    color: #ddd;
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .no-comments {
    font-style: italic;
    color: #aaa;
    text-align: center;
    padding: 1.5rem;
    background-color: #333;
    border-radius: 6px;
    border: 1px dashed #555;
  }
  
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
  
  /* Estilo tipo Instagram */
  .instagram-comments {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .comments-panel-instagram {
    display: flex;
    flex-direction: column;
    background-color: #2a2a2a;
    border-radius: 8px;
    height: 100%;
    overflow: hidden;
    color: #f0f0f0;
  }
  
  .comments-list-container-instagram {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    border-bottom: 1px solid #444;
  }
  
  .comment-form-instagram {
    padding: 1rem;
    background-color: #333;
    border-top: 1px solid #444;
  }
  
  .comment-form-instagram form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .comment-form-instagram .submit-btn {
    margin-top: 0.5rem;
  }
  
  /* Modo claro */
  @media (prefers-color-scheme: light) {
    .comments-panel, .comments-panel-instagram {
      background-color: white;
      border-color: #e0e0e0;
      color: #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .comment-form, .comment-form-instagram {
      background-color: #f9f9f9;
      border-color: #eaeaea;
    }
    
    h3 {
      color: #333;
    }
    
    label {
      color: #555;
    }
    
    input,
    textarea {
      background-color: white;
      border-color: #ccc;
      color: #333;
    }
    
    input:focus,
    textarea:focus {
      box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.2);
    }
    
    .comment {
      background-color: #f9f9f9;
    }
    
    .user-info strong {
      color: #333;
    }
    
    .comment-content {
      color: #444;
    }
    
    .no-comments {
      background-color: #f9f9f9;
      border-color: #ddd;
      color: #777;
    }
    
    .comments-list-container-instagram {
      border-bottom-color: #eaeaea;
    }
    
    .comment-form-instagram {
      background-color: white;
      border-top-color: #eaeaea;
    }
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .comments-panel {
      padding: 1rem;
    }
    
    .comment-form {
      padding: 1rem;
    }
    
    .submit-btn {
      width: 100%;
    }
  }
</style> 