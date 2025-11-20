export interface Company {
  id: string;
  name: string;
  category?: string;
  web?: string;
  description?: string;
  location?: string;
  rating?: number | null;
  photoURL?: string;
  address?: string;
}