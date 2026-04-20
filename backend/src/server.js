const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./startup");
const { startExpiryNotifier } = require("./jobs/expiryNotifier");

async function main() {
  if (!env.MONGODB_URI) throw new Error("Missing MONGODB_URI");

  await connectDB({ uri: env.MONGODB_URI });

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Listening on port ${env.PORT}`);
  });

  startExpiryNotifier();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("[server] Fatal startup error:", e);
  process.exit(1);
});

