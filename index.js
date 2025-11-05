import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";

dotenv.config();

const app = express();
app.get("/", (req, res) => res.send("✅ Bot is running 24/7 with UptimeRobot!"));
app.listen(3000, () => console.log("🌍 Keep-alive server running on port 3000"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const timersFile = "timers.json";
let timers = new Map();

function loadTimers() {
  if (fs.existsSync(timersFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(timersFile, "utf8"));
      const now = Date.now();
      let expired = 0;
      
      for (const key in data) {
        const timer = data[key];
        const respTime = new Date(timer.respTime);
        
        if (respTime.getTime() > now) {
          timers.set(key, timer);
        } else {
          expired++;
        }
      }
      
      if (expired > 0) {
        console.log(`🗑️ Removed ${expired} expired timer(s)`);
        saveTimers();
      }
      
      console.log(`💾 Loaded ${timers.size} active timer(s) from file.`);
    } catch (err) {
      console.error("Error loading timers.json:", err);
    }
  }
}

function saveTimers() {
  const obj = Object.fromEntries(timers);
  fs.writeFileSync(timersFile, JSON.stringify(obj, null, 2));
}

function scheduleTimer(bossKey, info) {
  const now = Date.now();
  const respTime = new Date(info.respTime);
  const reminderTime = new Date(respTime.getTime() - 15 * 60000);

  const timeUntilReminder = reminderTime.getTime() - now;
  const timeUntilResp = respTime.getTime() - now;

  if (timeUntilReminder > 0) {
    setTimeout(async () => {
      const channel = await client.channels.fetch(info.channelId).catch(() => null);
      if (channel)
        channel.send(`⚠️ Boss **${info.name} ${info.map}** will respawn in 15 minutes!`);
    }, timeUntilReminder);
  }

  if (timeUntilResp > 0) {
    setTimeout(() => {
      timers.delete(bossKey);
      saveTimers();
    }, timeUntilResp);
  }
}

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  loadTimers();
  for (const [key, info] of timers) scheduleTimer(key, info);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== "resp-boss") return;

  const content = message.content.trim();
  const lower = content.toLowerCase();

  if (lower.startsWith("!timery")) {
    if (timers.size === 0)
      return message.channel.send("📭 No active boss timers.");
    let list = "📋 **Active boss timers:**\n";
    timers.forEach((info) => {
      list += `• **${info.name} ${info.map}** → ${info.timeStr}\n`;
    });
    return message.channel.send(list);
  }

  if (lower.startsWith("!bossdel")) {
    const args = content.split(" ").slice(1);
    if (args.length < 2)
      return message.reply("❌ Usage: `!bossdel <name> <map>` e.g. `!bossdel Dragon King Kalima5`");

    const mapName = args[args.length - 1];
    const bossName = args.slice(0, -1).join(" ");
    const bossKey = `${bossName}-${mapName}`.toLowerCase();
    
    if (timers.has(bossKey)) {
      const info = timers.get(bossKey);
      timers.delete(bossKey);
      saveTimers();
      return message.channel.send(`🗑️ Deleted timer for **${info.name} ${info.map}**.`);
    } else {
      return message.reply("⚠️ Boss timer not found.");
    }
  }

  if (lower.startsWith("!timerclean")) {
    if (timers.size === 0)
      return message.channel.send("📭 No active timers to clean.");
    timers.clear();
    saveTimers();
    return message.channel.send("🧹 All timers cleared!");
  }

  if (!lower.startsWith("!boss")) return;

  const args = content.split(" ").slice(1);
  if (args.length < 3)
    return message.reply("❌ Usage: `!boss <name> <map> +<time>` e.g. `!boss Dragon King Kalima5 +8h30m`");

  const timeArgIndex = args.findIndex(arg => arg.startsWith("+"));
  if (timeArgIndex === -1)
    return message.reply("⚠️ Specify time in format e.g. `+8h`, `+45m`, `+2h30m`");

  if (timeArgIndex < 2)
    return message.reply("❌ Usage: `!boss <name> <map> +<time>` e.g. `!boss Dragon King Kalima5 +8h30m`");

  const timeArg = args[timeArgIndex];
  const mapName = args[timeArgIndex - 1];
  const bossName = args.slice(0, timeArgIndex - 1).join(" ");

  const match = timeArg.match(/^\+((\d+)h)?((\d+)m)?$/i);
  if (!match)
    return message.reply("⚠️ Invalid time format. Examples:\n`+8h`, `+45m`, `+2h30m`");

  const hours = match[2] ? parseInt(match[2]) : 0;
  const minutes = match[4] ? parseInt(match[4]) : 0;

  const now = new Date();
  const respTime = new Date(now.getTime() + hours * 3600000 + minutes * 60000);
  const timeStr = respTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const bossKey = `${bossName}-${mapName}`.toLowerCase();

  if (timers.has(bossKey))
    return message.reply(`⚠️ Timer for **${bossName} ${mapName}** already exists.`);

  const info = {
    name: bossName,
    map: mapName,
    timeStr,
    respTime,
    channelId: message.channel.id,
  };

  timers.set(bossKey, info);
  saveTimers();
  scheduleTimer(bossKey, info);
  message.channel.send(`🕒 Boss **${bossName} ${mapName}** will respawn at **${timeStr}** (${timeArg})`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
