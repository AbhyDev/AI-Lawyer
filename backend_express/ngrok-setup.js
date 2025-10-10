import "dotenv/config";
import ngrok from "@ngrok/ngrok";

const startNgrok = async () => {
  try {
    const listener = await ngrok.forward({
      addr: process.env.PORT,
      authtoken: process.env.NGROK_AUTHTOKEN,
      proto: "http",
    });

    console.log(`Webhook URL: ${listener.url()}/telegram/webhook`);
    console.log("Press Ctrl+C to stop the tunnel");

    // Handle Ctrl+C / SIGINT
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down ngrok tunnel...");
      await listener.close(); // closes this specific tunnel
      await ngrok.disconnect(); // disconnects all active tunnels (safety)
      await ngrok.kill(); // ensures ngrok process is killed
      console.log("✅ Tunnel closed. Exiting...");
      process.exit(0);
    });

    // Keep process alive
    process.stdin.resume();
  } catch (err) {
    console.error("❌ Failed to start ngrok:", err.message || err);
    process.exit(1);
  }
};

startNgrok();
