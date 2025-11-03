export interface Service {
  id: string;
  title: string;
  price: number | string;
  description?: string;
  duration?: number | string;
  category?: string;
}