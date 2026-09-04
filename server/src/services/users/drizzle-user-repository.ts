import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import type { UserRepository } from "./user-repository.interface.js";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types.js";

export class DrizzleUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const numericId = Number(id);
        const [row] = await db.select().from(users).where(eq(users.id, numericId));
        return row ? this.toDomain(row) : null;
    }

    async create(data: CreateUserInput): Promise<User> {
        const result = await db.insert(users).values(data);
        const insertId = result[0].insertId;

        const created = await this.findById(String(insertId));
        if (!created) {
        throw new Error("No se pudo recuperar el usuario recién creado");
        }
        return created;
    }

    private toDomain(row: typeof users.$inferSelect): User {
        return {
        id: String(row.id),
        email: row.email,
        name: row.name,
        secondName: row.secondName,
        age: row.age,
        password: row.password,
        phone: String(row.phone),
        };
    }

}