export interface MenuItem {
  title: string;
  path: string;
  category?: string;
  isHeader?: boolean;
}

export interface Product {
  slug: string;
  category: string;
  name: string;
  description: string; // Short excerpt for cards
  longDescription: string; // Full HTML content
  features: string[]; // List of key features
  amazonLink: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  coverImage: string;
  date: string;
  author: string;
  category: string;
  relatedTestPath?: string; // Link to a relevant tool in your app
  relatedTestName?: string;
}

export enum TestState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
}