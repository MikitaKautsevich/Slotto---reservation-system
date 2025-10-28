import { Timestamp } from "firebase/firestore";

export interface Reservation {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  companyId: string;
  serviceName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  participants: number;
  location?: string;
  notes?: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
}