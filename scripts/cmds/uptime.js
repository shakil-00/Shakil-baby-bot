const { GoatWrapper } = require("fca-liane-utils");
const os = require("os");
const fs = require("fs");
const path = require("path");

const startTime = Date.now();

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getApprovalStatus() {
  try {
    if (global.goat?.config?.APPROVAL_REQUIRED !== undefined) return global.goat.config.APPROVAL_REQUIRED;
    if (global.config?.APPROVAL_REQUIRED !== undefined) return global.config.APPROVAL_REQUIRED;

    const configPath = path.join(__dirname, "..", "config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return config.APPROVAL_REQUIRED || false;
    }
  } catch {}
  return false;
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const result = [];
  for (const [name, nets] of Object.entries(interfaces)) {
    for (const net of nets) {
      if (net.family === "IPv4" && !net.internal) {
        result.push(`${name}: ${net.address}`);
        break;
      }
    }
  }
  return result.length > 0 ? result.join(", ") : "No network info";
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "stats"],
    version: "2.2",
    author: "Badhon + Fix by BaYjid",
    role: 0,
    shortDescription: { en: "Full bot & system status" },
    longDescription: { en: "Check bot uptime, system info, media status, etc." },
    category: "Utility",
    guide: { en: "Type {pn} to check bot stats." }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const commandStartTime = Date.now();
      const serverUptime = process.uptime();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsage = (usedMem / totalMem * 100).toFixed(1);

      const approvalStatus = getApprovalStatus();
      const networkInfo = getNetworkInfo();

      let threadInfo;
      try {
        threadInfo = await new Promise((resolve) => {
          api.getThreadInfo(event.threadID, (err, info) => {
            if (err) resolve(null);
            else resolve(info);
          });
        });
      } catch {
        threadInfo = null;
      }

      let mediaStatus = "⚠ Not Available";
      let reactionStatus = "⚠ Not Available";
      if (threadInfo?.restrictions) {
        mediaStatus = threadInfo.restrictions.sendMedia ? "❌ Blocked" : "✅ Allowed";
        reactionStatus = threadInfo.restrictions.addReaction ? "❌ Blocked" : "✅ Allowed";
      } else if (threadInfo?.emoji !== undefined) {
        mediaStatus = "✅ Allowed";
        reactionStatus = "✅ Enabled";
      }

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const options = { timeZone: "Asia/Dhaka", hour12: false };
      const currentDate = new Date().toLocaleDateString("en-BD", options);
      const currentTime = new Date().toLocaleTimeString("en-BD", options);

      const commandExecutionTime = Date.now() - commandStartTime;
      const userThreadRatio = allThreads.length > 0 ? (allUsers.length / allThreads.length).toFixed(2) : "N/A";

      const msg =
`┌───│𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 𝗦𝗧𝗔𝗧𝗨𝗦│───
│
├ ➤ Uptime     : ${formatUptime(serverUptime)}
│
├─── [ 🖥 ꯱ʏꜱᴛᴇᴍ ɪɴꜰᴏ 🖥 ] ───
│
├ ➤ OS         : ${os.type()} (${os.platform()})
├ ➤ Arch       : ${os.arch()}
├ ➤ Node       : ${process.version}
├ ➤ OS Uptime  : ${formatUptime(os.uptime())}
├ ➤ CPU        : ${os.cpus()[0].model.split(" @")[0]}
├ ➤ Cores      : ${os.cpus().length}
├ ➤ RAM Usage  : ${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${memoryUsage}%)
│
├─── [ ⚙ ʙᴏᴛ ᴄᴏɴꜰɪɢ ⚙ ] ───
│
├ ➤ Approval   : ${approvalStatus ? "✅ Enabled" : "❌ Disabled"}
├ ➤ PID        : ${process.pid}
│
├─── [ 👥 ᴜꜱᴇʀ ꜱᴛᴀᴛꜱ 👥 ] ───
│
├ ➤ Users      : ${allUsers.length}
├ ➤ Threads    : ${allThreads.length}
├ ➤ TID        : ${event.threadID}
├ ➤ Members    : ${threadInfo ? threadInfo.participantIDs.length : "Unknown"}
├ ➤ Ratio      : ${userThreadRatio}
│
├─── [ 🌐 ɴᴇᴛᴡᴏʀᴋ 🌐 ] ───
│
├ ➤ Ping       : ${commandExecutionTime}ms
├ ➤ Network    : ${networkInfo}
│
├─── [ 🕒 ᴛɪᴍᴇ & ᴅᴀᴛᴇ 🕒 ] ───
│
├ ➤ Date       : ${currentDate}
├ ➤ Time       : ${currentTime}
├ ➤ Start Time : ${new Date(startTime).toLocaleString()}
│
├─── [ 🎥 ᴍᴇᴅɪᴀ ꜱᴛᴀᴛᴜꜱ 🎥 ] ───
│
├ ➤ Media      : ${mediaStatus}
├ ➤ Reactions  : ${reactionStatus}
│
└─── ✨ 𝚂𝙷𝙰𝙺𝙸𝙻 ✨ ───`;

      api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Failed to fetch bot status.", event.threadID);
    }
  }
};

// Apply GoatWrapper no-prefix support
try {
  const wrapper = new GoatWrapper(module.exports);
  if (wrapper && typeof wrapper.applyNoPrefix === "function") {
    wrapper.applyNoPrefix({ allowPrefix: true });
  }
} catch {}
