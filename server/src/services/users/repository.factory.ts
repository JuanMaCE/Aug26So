import { DrizzleUserRepository } from "./drizzle-user-repository.js";
import { MongoUserRepository } from "./mongo-user-repository.js";
import type { UserRepository } from "./user-repository.interface.js";

export class UserRepositoryFactory {
    private cachedRepo: UserRepository | null = null;

    createUserRepository(): UserRepository {
        if (this.cachedRepo) {
            return this.cachedRepo;
        }

        const engine = process.env.DB_ENGINE?.toLocaleLowerCase();
        
        if (engine === "mongo") {
            this.cachedRepo = new MongoUserRepository();
            return this.cachedRepo;
        }

        this.cachedRepo = new DrizzleUserRepository();
        return this.cachedRepo;
    }
}

export const userRepositoryFactory = new UserRepositoryFactory();