export interface Employee {
    id: string;
    name: string;
    position: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    servicesIds?: string[];
}