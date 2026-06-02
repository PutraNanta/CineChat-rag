import { loginUser, registerUser, toPublicUser } from "../services/authService.js";
import { findById } from "../repositories/usersRepository.js";
import { HttpError } from "../utils/httpError.js";

export async function postRegister(req, res) {
  const { name, email, password } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password) {
    throw new HttpError(400, "Nama, email, dan password wajib diisi.");
  }

  const result = await registerUser({
    name,
    email,
    password,
  });

  res.status(201).json(result);
}

export async function postLogin(req, res) {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    throw new HttpError(400, "Email dan password wajib diisi.");
  }

  const result = await loginUser({ email, password });
  res.json(result);
}

export async function getMe(req, res) {
  const user = await findById(req.user.id);
  if (!user || !user.is_active) {
    throw new HttpError(401, "Akun tidak ditemukan atau nonaktif.");
  }
  res.json({ user: toPublicUser(user) });
}
