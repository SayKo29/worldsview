export interface Photo {
  id: number;
  filename: string;
  title: string;
  description: string;
  date: string;
  category: 'naturaleza' | 'animales' | 'plantas' | 'flores';
  location?: string;
  url: string;
}

export const photos: Photo[] = [
  {
    id: 1,
    filename: 'DSC07238-01.jpeg',
    title: 'Reflejos del Amanecer',
    description: 'La luz matutina baila sobre las aguas tranquilas, creando un espejo natural que refleja la serenidad del momento.',
    date: '2025-07-14',
    category: 'naturaleza',
    location: 'Lago de la Serenidad',
    url: '/assets/blog-photos/DSC07238-01.jpeg'
  },
  {
    id: 2,
    filename: 'DSC07236-01.jpeg',
    title: 'Geometría Urbana',
    description: 'Líneas y formas se entrelazan en la arquitectura moderna, creando patrones que cuentan historias de la ciudad.',
    date: '2025-07-14',
    category: 'naturaleza',
    location: 'Centro Urbano',
    url: '/assets/blog-photos/DSC07236-01.jpeg'
  },
  {
    id: 3,
    filename: 'IMG_20250714_105608-01.jpeg',
    title: 'Calma en la Tormenta',
    description: 'Un momento de paz capturado en medio del caos urbano, donde la naturaleza y la ciudad se encuentran.',
    date: '2025-07-14',
    category: 'naturaleza',
    url: '/assets/blog-photos/IMG_20250714_105608-01.jpeg'
  },
  {
    id: 4,
    filename: 'DSC07099-01.jpeg',
    title: 'Atardecer en Silencio',
    description: 'El sol se despide pintando el cielo con tonos cálidos, creando un espectáculo de colores.',
    date: '2025-05-28',
    category: 'naturaleza',
    location: 'Mirador del Ocaso',
    url: '/assets/blog-photos/DSC07099-01.jpeg'
  },
  {
    id: 5,
    filename: 'DSC07104-01.jpeg',
    title: 'Texturas Naturales',
    description: 'Patrones orgánicos que la naturaleza crea, recordándonos la belleza en los pequeños detalles.',
    date: '2025-05-28',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07104-01.jpeg'
  },
  {
    id: 6,
    filename: 'DSC07106-01.jpeg',
    title: 'Ventanas al Pasado',
    description: 'La arquitectura antigua nos cuenta historias de tiempos pasados a través de sus detalles.',
    date: '2025-05-28',
    category: 'naturaleza',
    location: 'Casco Histórico',
    url: '/assets/blog-photos/DSC07106-01.jpeg'
  },
  {
    id: 7,
    filename: 'DSC07113-01.jpeg',
    title: 'Luces de la Ciudad',
    description: 'El pulso de la vida urbana capturado en un instante de luz y movimiento.',
    date: '2025-05-19',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07113-01.jpeg'
  },
  {
    id: 8,
    filename: 'DSC07121-01.jpeg',
    title: 'Sombras Danzantes',
    description: 'Juego de luces y sombras que crean una danza visual en las paredes de la ciudad.',
    date: '2025-05-19',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07121-01.jpeg'
  },
  {
    id: 9,
    filename: 'DSC07122-01.jpeg',
    title: 'Caminos del Destino',
    description: 'Senderos que se entrelazan, simbolizando las múltiples direcciones que puede tomar la vida.',
    date: '2025-05-19',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07122-01.jpeg'
  },
  {
    id: 10,
    filename: 'DSC07124-01.jpeg',
    title: 'Colores del Crepúsculo',
    description: 'El cielo se viste de gala con una paleta de colores que despide el día.',
    date: '2025-05-19',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07124-01.jpeg'
  },
  {
    id: 11,
    filename: 'DSC07082.JPG',
    title: 'Geometría Natural',
    description: 'La naturaleza demuestra su perfección matemática en cada detalle.',
    date: '2025-03-06',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07082.JPG'
  },
  {
    id: 12,
    filename: 'DSC07038-01.jpeg',
    title: 'Perspectivas Urbanas',
    description: 'La ciudad vista desde un ángulo diferente revela nuevas historias.',
    date: '2025-03-06',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07038-01.jpeg'
  },
  {
    id: 13,
    filename: 'DSC07049-01.jpeg',
    title: 'Reflejos Modernos',
    description: 'La arquitectura contemporánea juega con los reflejos creando ilusiones visuales.',
    date: '2025-03-05',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07049-01.jpeg'
  },
  {
    id: 14,
    filename: 'DSC07068-01.jpeg',
    title: 'Momentos de Calma',
    description: 'Un instante de paz capturado en medio del movimiento constante.',
    date: '2025-03-05',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07068-01.jpeg'
  },
  {
    id: 15,
    filename: 'DSC07072-01.jpeg',
    title: 'Arte Urbano',
    description: 'Las calles se convierten en lienzos para expresiones artísticas contemporáneas.',
    date: '2025-02-16',
    category: 'naturaleza',
    url: '/assets/blog-photos/DSC07072-01.jpeg'
  }
];

export const getPhotosByCategory = (category: Photo['category']) => {
  return photos.filter(photo => photo.category === category);
};

export const getPhotoById = (id: number) => {
  return photos.find(photo => photo.id === id);
};

export const getLatestPhotos = (limit: number = 6) => {
  return [...photos]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const categories = ['naturaleza', 'animales', 'plantas', 'flores']; 