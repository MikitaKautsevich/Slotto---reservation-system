import { Service } from "./service";

export interface Company {
  id: string;
  name: string;
  category?: string;
  web?: string;
  description?: string;
  location?: string;
  rating?: number | null;
  totalReviews?: number;
  photoURL?: string;
  address?: string;
  services: Service[];
  openTime?: string;
  closeTime?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}