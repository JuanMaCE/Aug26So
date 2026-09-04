import type { User } from "../users/user.types.js";

export interface ValidationResult {
    success: boolean;
    message?: string;
}

export interface UserValidator {
    validate(user: User): Promise<ValidationResult>;
}