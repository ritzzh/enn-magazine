export interface Magazine {
  id: number;
  title: string;
  headline: string;
  description: string;
  category: string;
  month: string;
  year: number;
  release_date: string;
  cover_image: string | null;
  pdf_file: string | null;
  cover_gradient: string;
  is_featured: number;
  is_published: number;
  download_count: number;
  like_count: number;
  created_at: string;
  userLiked?: boolean;
}

export interface NewsPost {
  id: number;
  title: string;
  slug: string;
  content: string; // rich HTML
  excerpt: string;
  cover_image: string | null;
  tags: string; // comma-separated
  author_id: number;
  author_name: string;
  is_published: number;
  is_featured: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  userLiked?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author_name: string;
  user_id: number | null;
  user_name: string | null;
  upvotes: number;
  parent_id: number | null;
  created_at: string;
  replies?: Comment[];
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}
