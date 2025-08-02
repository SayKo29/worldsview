// Sistema central de gestión del tema - Versión simplificada para Astro 5.12
const ThemeHandler = {
  // Aplicar el tema al DOM
  applyTheme(theme) {
    if (typeof window === 'undefined' || !document) return;
    
    try {
      // Validar tema
      const validTheme = theme === 'dark' || theme === 'light' ? theme : 'light';
      
      // Aplicar clases
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${validTheme}`);
      document.documentElement.dataset.theme = validTheme;
      
      // Guardar en localStorage
      localStorage.setItem('theme', validTheme);
      
      // Emitir evento personalizado en window
      const event = new CustomEvent('themechange', {
        detail: { theme: validTheme },
        bubbles: true
      });
      window.dispatchEvent(event);
      
      console.log('✅ Tema aplicado:', validTheme);
      return validTheme;
    } catch (e) {
      console.error('❌ Error aplicando tema:', e);
      return theme;
    }
  },
  
  // Obtener tema actual
  getTheme() {
    if (typeof window === 'undefined') return 'light';
    
    try {
      // Intentar desde localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      
      // Intentar desde preferencias del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error accediendo a localStorage:', e);
    }
    
    return 'light';
  },
  
  // Cambiar al tema opuesto
  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('🔄 Cambiando tema de', currentTheme, 'a', newTheme);
    return this.applyTheme(newTheme);
  },
  
  // Inicializar sistema de temas
  initialize() {
    if (typeof window === 'undefined') return null;
    
    try {
      const theme = this.getTheme();
      console.log('🏁 Inicializando sistema de temas con:', theme);
      
      // Aplicar tema inicial
      this.applyTheme(theme);
      
      // Escuchar cambios de tema del sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e) => {
        if (!localStorage.getItem('theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      };
      
      // Añadir listener con compatibilidad
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
      }
      
      return theme;
    } catch (e) {
      console.error('Error inicializando tema:', e);
      return null;
    }
  }
};

// Exportar para usar en componentes
export default ThemeHandler;