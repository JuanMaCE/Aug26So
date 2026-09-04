import type { User } from "../users/user.types.js";

export interface ValidationResult {
    success: boolean;
    message?: string;
    previewUrl?: string | null;
}

export interface UserValidator {
    validate(user: User): Promise<ValidationResult>;
}