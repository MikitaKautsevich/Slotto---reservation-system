export interface Participant {
  name: string;
  serviceId: string;
  employeeId: string;
  time: string;
  address?: string;
  date?: string;
  isMain?: boolean; // главный клиент
}