import { dbConfigured } from "../config/env.js";
import { memorySessionStore } from "./sessionStore.memory.js";
import { mysqlSessionStore } from "./sessionStore.mysql.js";

/** Pilih penyimpanan sesi: MySQL jika DB dikonfigurasi, else in-memory. */
export const sessionStore = dbConfigured ? mysqlSessionStore : memorySessionStore;
