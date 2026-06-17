export const siteConfig = {
  artistName: 'Diana Morales',
  tagline: 'Ilustraciones y pinturas originales',
  heroPhrase: 'Cada trazo cuenta una historia única',
  heroImage: 'https://placehold.co/1200x600/f5f5f5/a3a3a3?text=Obra+Destacada',
  email: 'hola@dianamorales.cl',
  instagram: 'https://instagram.com/dianamorales.art',
  instagramHandle: '@dianamorales.art',
  bio: `Soy Diana, ilustradora y pintora radicada en Santiago de Chile. Mi trabajo explora la conexión entre lo natural y lo emocional a través de la acuarela, la tinta y el óleo.

Cada pieza que creo es única e irrepetible. Trabajo principalmente con materiales tradicionales porque creo en la belleza de lo imperfecto y lo hecho a mano.

Mis ilustraciones buscan capturar momentos efímeros: la luz de una tarde, el movimiento de una planta, la quietud de un espacio vacío.`,
  statement: 'Creo en el arte como un acto íntimo. Cada obra es una conversación silenciosa entre el material y la intuición.',
  profilePhoto: 'https://placehold.co/500x600/f5f5f5/a3a3a3?text=Retrato',
  contactText: 'Si tienes alguna consulta sobre mis obras, encargos personalizados o cualquier otra cosa, no dudes en escribirme.',
};

export const artworks = [
  {
    id: 'art-1',
    title: 'Naturaleza silenciosa',
    category: 'acuarela',
    technique: 'Acuarela sobre papel',
    image: 'https://placehold.co/400x500/f0ebe3/a3a3a3?text=1',
    year: 2024,
  },
  {
    id: 'art-2',
    title: 'Raíces',
    category: 'tinta',
    technique: 'Tinta china sobre papel',
    image: 'https://placehold.co/400x500/e8e4df/a3a3a3?text=2',
    year: 2024,
  },
  {
    id: 'art-3',
    title: 'Fragmento azul',
    category: 'oleo',
    technique: 'Óleo sobre tela',
    image: 'https://placehold.co/400x500/e3e8f0/a3a3a3?text=3',
    year: 2023,
  },
  {
    id: 'art-4',
    title: 'Estudio de luz I',
    category: 'acuarela',
    technique: 'Acuarela y grafito',
    image: 'https://placehold.co/400x500/f5f0e8/a3a3a3?text=4',
    year: 2023,
  },
  {
    id: 'art-5',
    title: 'Composición orgánica',
    category: 'mixta',
    technique: 'Técnica mixta sobre papel',
    image: 'https://placehold.co/400x500/ede8e3/a3a3a3?text=5',
    year: 2024,
  },
  {
    id: 'art-6',
    title: 'Murmullos',
    category: 'tinta',
    technique: 'Tinta y acuarela',
    image: 'https://placehold.co/400x500/e8ede3/a3a3a3?text=6',
    year: 2023,
  },
  {
    id: 'art-7',
    title: 'Paisaje interior',
    category: 'oleo',
    technique: 'Óleo sobre madera',
    image: 'https://placehold.co/400x500/e3e8ed/a3a3a3?text=7',
    year: 2024,
  },
  {
    id: 'art-8',
    title: 'Sin título No. 12',
    category: 'mixta',
    technique: 'Collage y acrílico',
    image: 'https://placehold.co/400x500/f0e8e3/a3a3a3?text=8',
    year: 2024,
  },
];

export const products = [
  {
    id: 'prod-1',
    slug: 'naturaleza-silenciosa',
    title: 'Naturaleza silenciosa',
    price: 180000,
    status: 'disponible',
    type: 'original',
    technique: 'Acuarela sobre papel 300g',
    dimensions: '30 x 40 cm',
    description: 'Pieza original inspirada en la flora nativa del sur de Chile. Colores suaves y orgánicos que evocan la calma de un bosque en invierno.',
    images: [
      'https://placehold.co/600x750/f0ebe3/a3a3a3?text=Vista+1',
      'https://placehold.co/600x750/ede8e3/a3a3a3?text=Vista+2',
      'https://placehold.co/600x750/e8e4df/a3a3a3?text=Detalle',
    ],
    featured: true,
  },
  {
    id: 'prod-2',
    slug: 'raices',
    title: 'Raíces',
    price: 120000,
    status: 'disponible',
    type: 'original',
    technique: 'Tinta china sobre papel algodón',
    dimensions: '25 x 35 cm',
    description: 'Trabajo en tinta que explora las formas orgánicas de las raíces y su conexión con la tierra. Líneas fluidas y espontáneas.',
    images: [
      'https://placehold.co/600x750/e8e4df/a3a3a3?text=Vista+1',
      'https://placehold.co/600x750/e3e0db/a3a3a3?text=Vista+2',
    ],
    featured: true,
  },
  {
    id: 'prod-3',
    slug: 'fragmento-azul',
    title: 'Fragmento azul',
    price: 350000,
    status: 'reservado',
    type: 'original',
    technique: 'Óleo sobre tela',
    dimensions: '50 x 70 cm',
    description: 'Obra de gran formato en tonos azules y grises. Capas de pintura que crean profundidad y textura.',
    images: [
      'https://placehold.co/600x750/e3e8f0/a3a3a3?text=Vista+1',
      'https://placehold.co/600x750/dde3ed/a3a3a3?text=Detalle',
    ],
    featured: false,
  },
  {
    id: 'prod-4',
    slug: 'estudio-de-luz',
    title: 'Estudio de luz I',
    price: 95000,
    status: 'disponible',
    type: 'original',
    technique: 'Acuarela y grafito',
    dimensions: '20 x 28 cm',
    description: 'Estudio rápido que captura la luz de una tarde de otoño. Trazos sueltos y lavados suaves.',
    images: [
      'https://placehold.co/600x750/f5f0e8/a3a3a3?text=Vista+1',
    ],
    featured: true,
  },
  {
    id: 'prod-5',
    slug: 'composicion-organica',
    title: 'Composición orgánica',
    price: 150000,
    status: 'vendido',
    type: 'original',
    technique: 'Técnica mixta sobre papel',
    dimensions: '35 x 50 cm',
    description: 'Pieza que combina acuarela, tinta y collage. Formas abstractas inspiradas en la naturaleza.',
    images: [
      'https://placehold.co/600x750/ede8e3/a3a3a3?text=Vista+1',
    ],
    featured: false,
  },
  {
    id: 'prod-6',
    slug: 'murmullos',
    title: 'Murmullos',
    price: 110000,
    status: 'disponible',
    type: 'original',
    technique: 'Tinta y acuarela',
    dimensions: '28 x 38 cm',
    description: 'Ilustración delicada en blanco y negro con toques sutiles de color. Inspirada en el sonido del agua.',
    images: [
      'https://placehold.co/600x750/e8ede3/a3a3a3?text=Vista+1',
      'https://placehold.co/600x750/e3e8de/a3a3a3?text=Vista+2',
    ],
    featured: true,
  },
];

export const categories = [
  { id: 'todas', label: 'Todas' },
  { id: 'acuarela', label: 'Acuarela' },
  { id: 'tinta', label: 'Tinta' },
  { id: 'oleo', label: 'Óleo' },
  { id: 'mixta', label: 'Mixta' },
];

export function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function getStatusLabel(status) {
  const labels = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: 'Vendido',
  };
  return labels[status] || status;
}
