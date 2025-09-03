const os = require("os");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function createProgressBar(percentage) {
  const totalBars = 20;
  const filledBars = Math.round((totalBars * percentage) / 100);
  const emptyBars = totalBars - filledBars;
  return "█".repeat(filledBars) + "░".repeat(emptyBars);
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "ut"],
    version: "4.0-premium",
    author: "𝗕𝗔𝗗𝗛𝗢𝗡 𝗥𝗢𝗛𝗠𝗔𝗡 💀✨",
    role: 0,
    shortDescription: {
      en: "Premium Uptime & System Stats"
    },
    longDescription: {
      en: "Displays system uptime, performance, memory usage, and other system stats in a premium UI format."
    },
    category: "tools",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const start = Date.now();

      const uptimeInSeconds = process.uptime();
      const formattedUptime = formatTime(uptimeInSeconds);

      const ping = Date.now() - start;
      const maxUptimeSeconds = 86400;
      const uptimePercent = Math.min((uptimeInSeconds / maxUptimeSeconds) * 100, 100).toFixed(2);
      const uptimeProgressBar = createProgressBar(uptimePercent);

      const cpuLoad = os.loadavg()[0].toFixed(2);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMemPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
      const userName = os.userInfo().username;

      const quotes = [
        "⚙️ “Coding is not just code, it's a lifestyle.”",
        "🚀 “Wake up, Code, Repeat.”",
        "🌙 “Dream in code, live in reality.”",
        "🤖 “Bots run the world silently.”"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const uptimeMessage = `
  〔 👑 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 👑 〕

🟢 𝗨𝗣𝗧𝗜𝗠𝗘
⏱️ ${formattedUptime}
📈 [ ${uptimeProgressBar} ] ${uptimePercent}%

📡 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘
⚡ Ping: ${ping}% ms
🤖 Bot: Melisa
🔖 Version: v1.0

🖥️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦
👤 User: ${userName}
💾 Memory Usage: ${usedMemPercent}%
💻 CPU Load: ${cpuLoad}

💬 𝗠𝗢𝗧𝗜𝗩𝗔𝗧𝗜𝗢𝗡
${randomQuote}

   〔 ✦ 𝗕𝗔𝗗𝗛𝗢𝗡 𝗥𝗢𝗛𝗠𝗔𝗡 ✦ 〕
`;

      await delay(300);
      await api.sendMessage(uptimeMessage, event.threadID);
    } catch (err) {
      console.error("Uptime command error:", err);
      return api.sendMessage("❌ An error occurred while fetching uptime data.", event.threadID);
    }
  }
};
