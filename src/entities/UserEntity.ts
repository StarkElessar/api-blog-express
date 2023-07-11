import { BaseEntity } from './BaseEntity';

export class UserEntity extends BaseEntity {
    public email: string;
    public password: string;
    public firstName: string | null;
    public lastName: string | null;
    public age: number | null
    public isActivated: boolean;
    public activationLink: string | null;
    public role: string;
}
