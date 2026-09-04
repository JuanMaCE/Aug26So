import type { CreateUserInput, UpdateUserInput, User } from "./user.types.js";

export interface UserRepository {
    //findAll(): Promise<User[]>;
    findById(id: string): Promise <User | null>;
    create(data: CreateUserInput): Promise <User>;
    //update(id: string, data: UpdateUserInput): Promise<void>;
    //delete(id: string): Promise<void>;
}

