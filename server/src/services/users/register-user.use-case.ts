import { userRepositoryFactory, UserRepositoryFactory } from "./repository.factory.js";
import type { CreateUserInput, User } from "./user.types.js";
import { emailUserValidator } from "../email/email-user-validator.js";
import type { UserValidator } from "../email/user-validator.interface.js";

export interface RegisterUserResult {
  user: User;
  verificationSent: boolean;
  verificationMessage?: string;
}

export class RegisterUserUseCase {
  constructor(private validator: UserValidator = emailUserValidator) {}

    async execute(data: CreateUserInput): Promise<RegisterUserResult> {
        const repository = userRepositoryFactory.createUserRepository(); 
        const user = await repository.create(data);
        const validation = await this.validator.validate(user);

        return {
            user,
            verificationSent: validation.success,
            ...(validation.message ? { verificationMessage: validation.message } : {})
        };
    }
}


export const registerUserUseCase = new RegisterUserUseCase();