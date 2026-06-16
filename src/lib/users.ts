import { ObjectId } from "mongodb";
import { ensureIndexes, getDb } from "@/lib/db";

export interface UserRecord {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  await ensureIndexes();
  const db = await getDb();
  return db.collection<UserRecord>("users").findOne({ email });
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  await ensureIndexes();
  const db = await getDb();
  const user = await db.collection<UserRecord>("users").findOne({
    _id: new ObjectId(id),
  });

  return user ? toPublicUser(user) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<PublicUser> {
  await ensureIndexes();
  const db = await getDb();
  const now = new Date();

  const result = await db.collection<UserRecord>("users").insertOne({
    _id: new ObjectId(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.insertedId.toString(),
    name: input.name,
    email: input.email,
  };
}
