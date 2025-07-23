export interface Photo {
  id: number;
  filename: string;
  title: string;
  description: string;
  date: string;
  category: 'naturaleza' | 'ciudad' | 'arquitectura' | 'atardecer' | 'arte' | 'viajes';
  location?: string;
}

export const photos: Photo[] = [
  {
    id: 1,
    filename: 'DSC07238-01.jpeg',
    title: 'Reflejos del Amanecer',
    description: 'La luz matutina baila sobre las aguas tranquilas, creando un espejo natural que refleja la serenidad del momento.',
    date: '2025-07-14',
    category: 'naturaleza',
    location: 'Lago de la Serenidad'
  },
  {
    id: 2,
    filename: 'DSC07236-01.jpeg',
    title: 'Geometría Urbana',
    description: 'Líneas y formas se entrelazan en la arquitectura moderna, creando patrones que cuentan historias de la ciudad.',
    date: '2025-07-14',
    category: 'arquitectura',
    location: 'Centro Urbano'
  },
  {
    id: 3,
    filename: 'IMG_20250714_105608-01.jpeg',
    title: 'Calma en la Tormenta',
    description: 'Un momento de paz capturado en medio del caos urbano, donde la naturaleza y la ciudad se encuentran.',
    date: '2025-07-14',
    category: 'ciudad'
  },
  {
    id: 4,
    filename: 'DSC07099-01.jpeg',
    title: 'Atardecer en Silencio',
    description: 'El sol se despide pintando el cielo con tonos cálidos, creando un espectáculo de colores.',
    date: '2025-05-28',
    category: 'atardecer',
    location: 'Mirador del Ocaso'
  },
  {
    id: 5,
    filename: 'DSC07104-01.jpeg',
    title: 'Texturas Naturales',
    description: 'Patrones orgánicos que la naturaleza crea, recordándonos la belleza en los pequeños detalles.',
    date: '2025-05-28',
    category: 'naturaleza'
  },
  {
    id: 6,
    filename: 'DSC07106-01.jpeg',
    title: 'Ventanas al Pasado',
    description: 'La arquitectura antigua nos cuenta historias de tiempos pasados a través de sus detalles.',
    date: '2025-05-28',
    category: 'arquitectura',
    location: 'Casco Histórico'
  },
  {
    id: 7,
    filename: 'DSC07113-01.jpeg',
    title: 'Luces de la Ciudad',
    description: 'El pulso de la vida urbana capturado en un instante de luz y movimiento.',
    date: '2025-05-19',
    category: 'ciudad'
  },
  {
    id: 8,
    filename: 'DSC07121-01.jpeg',
    title: 'Sombras Danzantes',
    description: 'Juego de luces y sombras que crean una danza visual en las paredes de la ciudad.',
    date: '2025-05-19',
    category: 'arte'
  },
  {
    id: 9,
    filename: 'DSC07122-01.jpeg',
    title: 'Caminos del Destino',
    description: 'Senderos que se entrelazan, simbolizando las múltiples direcciones que puede tomar la vida.',
    date: '2025-05-19',
    category: 'viajes'
  },
  {
    id: 10,
    filename: 'DSC07124-01.jpeg',
    title: 'Colores del Crepúsculo',
    description: 'El cielo se viste de gala con una paleta de colores que despide el día.',
    date: '2025-05-19',
    category: 'atardecer'
  },
  {
    id: 11,
    filename: 'DSC07082.JPG',
    title: 'Geometría Natural',
    description: 'La naturaleza demuestra su perfección matemática en cada detalle.',
    date: '2025-03-06',
    category: 'naturaleza'
  },
  {
    id: 12,
    filename: 'DSC07038-01.jpeg',
    title: 'Perspectivas Urbanas',
    description: 'La ciudad vista desde un ángulo diferente revela nuevas historias.',
    date: '2025-03-06',
    category: 'ciudad'
  },
  {
    id: 13,
    filename: 'DSC07049-01.jpeg',
    title: 'Reflejos Modernos',
    description: 'La arquitectura contemporánea juega con los reflejos creando ilusiones visuales.',
    date: '2025-03-05',
    category: 'arquitectura'
  },
  {
    id: 14,
    filename: 'DSC07068-01.jpeg',
    title: 'Momentos de Calma',
    description: 'Un instante de paz capturado en medio del movimiento constante.',
    date: '2025-03-05',
    category: 'naturaleza'
  },
  {
    id: 15,
    filename: 'DSC07072-01.jpeg',
    title: 'Arte Urbano',
    description: 'Las calles se convierten en lienzos para expresiones artísticas contemporáneas.',
    date: '2025-02-16',
    category: 'arte'
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

export const categories = [
  { id: 'naturaleza', name: 'Naturaleza' },
  { id: 'ciudad', name: 'Ciudad' },
  { id: 'arquitectura', name: 'Arquitectura' },
  { id: 'atardecer', name: 'Atardecer' },
  { id: 'arte', name: 'Arte' },
  { id: 'viajes', name: 'Viajes' }
] as const; 