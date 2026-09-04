import type { UserValidator } from "./user-validator.interface.js";
import { emailUserValidator } from "./email-user-validator.js";
import { SmsUserValidator } from "../phone/sms-user-validator.js";
 

export class UserValidatorFactory { 
    private cachedValidator: UserValidator | null = null;

    createUserValidator(): UserValidator {
        if (this.cachedValidator) {
            return this.cachedValidator;
        }
        
        const method = process.env.USER_VALIDATION_METHOD?.toLowerCase();
        
        console.log("UserValidatorFactory: USER_VALIDATION_METHOD =", method);

        if (method === "sms") {
            console.log("UserValidatorFactory: Using SMS validation method");
            this.cachedValidator = new SmsUserValidator();
            return this.cachedValidator;
        }

        this.cachedValidator = emailUserValidator;
        return this.cachedValidator;

    }
}

export const userValidatorFactory = new UserValidatorFactory();

