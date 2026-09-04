import {
  mysqlTable,
  int,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 150 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  secondName: varchar("secondName", { length: 100}).notNull(),
  age: int("Age").notNull(),
  password: varchar("password", {length: 250}).notNull() ,
  phone: varchar("phone", { length: 20 }),
});


