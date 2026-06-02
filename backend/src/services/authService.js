import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { createUser, findByEmail } from "../repositories/usersRepository.js";
import { HttpError } from "../utils/httpError.js";

const SALT_ROUNDS = 10;

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.display_name,
    username: user.username,
  };
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.display_name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === env.GUEST_USER_EMAIL.toLowerCase()) {
    throw new HttpError(400, "Email ini tidak dapat digunakan untuk pendaftaran.");
  }

  const existing = await findByEmail(normalizedEmail);

  if (existing) {
    throw new HttpError(409, "Email sudah terdaftar.");
  }

  if (password.length < 6) {
    throw new HttpError(400, "Password minimal 6 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    email: normalizedEmail,
    passwordHash,
    displayName: name.trim(),
  });

  return {
    token: signAccessToken(user),
    user: toPublicUser(user),
  };
}

export async function loginUser({ email, password }) {
  const user = await findByEmail(email);

  if (!user || !user.is_active) {
    throw new HttpError(401, "Email atau password salah.");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, "Email atau password salah.");
  }

  return {
    token: signAccessToken(user),
    user: toPublicUser(user),
  };
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
