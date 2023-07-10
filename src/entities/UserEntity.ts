import { BaseEntity } from './BaseEntity';

export class UserEntity extends BaseEntity {
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    age: number | null
    isActivated: boolean;
    activationLink: string | null;
    role: string;
}
