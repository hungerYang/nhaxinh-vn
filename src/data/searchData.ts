import articles from './articles.json';
import submissions from './submissions.json';
import products from './products.json';

export interface SearchableItem {
  id: string;
  type: 'article' | 'submission' | 'product';
  title: string;
  description: string;
  image: string;
  style?: string;
  room?: string;
  author?: string;
  date?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  likes?: number;
}

export function getAllSearchableItems(): SearchableItem[] {
  const articleItems: SearchableItem[] = articles.map((a) => ({
    id: String(a.id),
    type: 'article' as const,
    title: a.title,
    description: a.description,
    image: a.image,
    style: a.style,
    room: a.room,
    author: a.author,
    date: a.date,
  }));

  const submissionItems: SearchableItem[] = submissions.map((s) => ({
    id: s.id,
    type: 'submission' as const,
    title: s.title,
    description: s.description,
    image: s.image,
    style: s.style,
    room: s.room,
    author: s.author,
    date: s.date,
    likes: s.likes,
  }));

  const productItems: SearchableItem[] = products.map((p) => ({
    id: p.id,
    type: 'product' as const,
    title: p.name,
    description: `${p.category} - ${p.discount}% off`,
    image: p.image,
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
  }));

  return [...articleItems, ...submissionItems, ...productItems];
}
