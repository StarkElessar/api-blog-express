import { compare, hash } from 'bcrypt';

export class UserEntity {
    private readonly _email: string;
    private _password: string;
    private readonly _role: string;

    constructor(email: string, role: string = 'user', passwordHash?: string) {
        this._email = email;
        this._role = role;

        if (passwordHash) {
            this._password = passwordHash;
        }
    }

    get email(): string {
        return this._email;
    }

    get role(): string {
        return this._role;
    }

    get password(): string {
        return this._password;
    }

    public async setPassword(password: string, salt: number): Promise<void> {
        this._password = await hash(password, salt);
    }

    public async comparePassword(password: string): Promise<boolean> {
        return compare(password, this._password);
    }
}
