import { Timestamp } from "firebase/firestore";

export interface Review {
  id: string;
  comment: string;
  createdAt: Timestamp;
  name: string;
  rating: number;
}