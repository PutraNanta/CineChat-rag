import { createApp } from "./src/app.js";
import { pingDatabase } from "./src/config/database.js";
import { dbConfigured, env, nodeRedConfiguredMap } from "./src/config/env.js";
import { ensureGuestUserId } from "./src/repositories/usersRepository.js";

const app = createApp();

app.listen(env.PORT, async () => {
  console.log(`Backend running on port ${env.PORT}`);
  console.log("Configured Node-RED endpoints:", nodeRedConfiguredMap);

  const dbStatus = await pingDatabase();
  if (!dbConfigured) {
    console.log("MySQL config: belum diatur (DB_HOST/DB_USER/DB_NAME).");
  } else if (dbStatus.ok) {
    console.log("MySQL connection: connected.");
    try {
      const guestId = await ensureGuestUserId();
      console.log("Guest user ready:", guestId);
    } catch (guestError) {
      console.error("Guest user setup failed:", guestError?.message || guestError);
    }
  } else {
    console.error("MySQL connection: failed.", dbStatus.reason);
  }
});
