import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfsaxdwjzzfmtjgsyyml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmc2F4ZHdqenpmbXRqZ3N5eW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODIxMzYsImV4cCI6MjA2ODk1ODEzNn0.RovMkbHynaD4R_d6ntAXOJKFtM0CTUhG1XJLty7vugM';

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  user_id?: string;
  author_name?: string;
  content: string;
  page_path: string;
  resource_id?: string;
  resource_type?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

// Función para generar un ID único para el comentario
function generateCommentId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function fetchComments(pagePath: string, resourceId?: string): Promise<Comment[]> {
  let query = supabase
    .from('comments')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('page_path', pagePath)
    .order('created_at', { ascending: true });
  
  if (resourceId) {
    query = query.eq('resource_id', resourceId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  return data || [];
}

export async function addComment(
  content: string, 
  authorName: string,
  pagePath: string, 
  resourceId?: string, 
  resourceType?: string, 
  parentId?: string
): Promise<Comment | null> {
  // Intentar obtener el usuario autenticado (si existe)
  const { data: { user } } = await supabase.auth.getUser();
  
  const commentData: any = {
    content,
    page_path: pagePath,
    resource_id: resourceId,
    resource_type: resourceType,
    parent_id: parentId
  };
  
  // Si hay un usuario autenticado, usar su ID
  if (user) {
    commentData.user_id = user.id;
  } else {
    // Si no hay usuario autenticado, usar el nombre proporcionado
    commentData.author_name = authorName;
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      profile:profiles(*)
    `)
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  return data;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  
  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  
  return true;
} 