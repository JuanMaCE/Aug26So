import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Document } from "mongodb";
import { getUsersCollection } from "../../db/mongo.js";
import type { UserRepository } from "./user-repository.interface.js";
import type { CreateUserInput, UpdateUserInput, User } from "./user.types.js";

export class MongoUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {    
    const collection = await getUsersCollection();
    const docs = await collection.find().toArray();
    return docs.map(this.toDomain);
  }

  async findById(id: string): Promise<User | null> {
    const collection = await getUsersCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const collection = await getUsersCollection();
    const result = await collection.insertOne(data);
    return { id: result.insertedId.toString(), ...data };
  }

  async update(id: string, data: UpdateUserInput): Promise<void> {
    const collection = await getUsersCollection();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  }

  async delete(id: string): Promise<void> {
    const collection = await getUsersCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });
  }

  /** Convierte un documento de Mongo (_id: ObjectId) al User del dominio (id: string). */
  private toDomain(doc: Document): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      secondName: doc.secondName,
      age: doc.age,
      password: doc.password,
      number: doc.phone.toString()
    };
  }
}