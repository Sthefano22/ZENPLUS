import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import type { LoginInput, RegisterInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET ?? "zenplus-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.users.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const [firstName, ...rest] = input.fullName.trim().split(" ");
  const lastName = rest.join(" ") || null;

  const user = await prisma.users.create({
    data: {
      id: randomUUID(),
      email: input.email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: input.role,
    },
  });

  logger.info({ userId: user.id, email: user.email }, "User registered");
  return {
    id: user.id,
    email: user.email,
    fullName: `${user.first_name} ${user.last_name ?? ""}`.trim(),
    role: user.role,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.users.findUnique({
    where: { email: input.email },
  });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  logger.info({ userId: user.id }, "User logged in");
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: `${user.first_name} ${user.last_name ?? ""}`.trim(),
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");
  return {
    id: user.id,
    email: user.email,
    fullName: `${user.first_name} ${user.last_name ?? ""}`.trim(),
    role: user.role,
  };
}