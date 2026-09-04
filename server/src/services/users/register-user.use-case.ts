import { userRepositoryFactory } from "./repository.factory.js";
import type { CreateUserInput, User } from "./user.types.js";
import { userValidatorFactory } from "../email/user-validator.factory.js";


export interface RegisterUserResult {
  user: User;
  verificationSent: boolean;
  verificationMessage?: string;
  previewUrl?: string | null;
}

export class RegisterUserUseCase {
  async execute(data: CreateUserInput): Promise<RegisterUserResult> {
    const repository = userRepositoryFactory.createUserRepository();
    const validator = userValidatorFactory.createUserValidator();
 
    const user = await repository.create(data);
    const validation = await validator.validate(user);
 
    return {
      user,
      verificationSent: validation.success,
      ...(validation.message ? { verificationMessage: validation.message } : {}),
      ...(validation.previewUrl ? { previewUrl: validation.previewUrl } : {}),
    };
  }
}
 
export const registerUserUseCase = new RegisterUserUseCase();
 