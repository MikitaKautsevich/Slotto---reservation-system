export interface Employee {
    id: string;
    name: string;
    position: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    bio?: string;
    createdAt?: Date;
    servicesIds?: string[];
}