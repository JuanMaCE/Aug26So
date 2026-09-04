export interface User {
    id: string;
    email: string;
    name: string;
    secondName: string;
    age: number;
    password: string;
    phone?: string;

}

export interface CreateUserInput{
    email: string;
    name: string;
    secondName: string
    age: number;
    password: string;
    phone?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;