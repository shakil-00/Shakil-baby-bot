const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.20",
    author: "badhon",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage" },
    longDescription: { en: "📜 View command usage and list all commands directly" },
    category: "ℹ Info",
    guide: { en: "🔹 {pn} / help cmdName" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role, usersData }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);
    let filterAuthor = null;
    let filterCategory = null;

    if (args.length > 0 && !args[0].startsWith("-")) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) return message.reply(`❌ Command "${commandName}" not found.`);

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const usage = (configCommand.guide?.en || "No guide available.")
        .replace(/{pn}/g, prefix)
        .replace(/{n}/g, configCommand.name);

      return message.reply(
        `╭───────────────◆
│ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
├───────────────●
│ ❖ 𝗡𝗮𝗺𝗲: ${configCommand.name}
│ 📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${configCommand.longDescription?.en || "No description"}
│ 🔤 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${configCommand.aliases?.join(", ") || "None"}
│ 🏷️ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${configCommand.version || "1.0"}
│ 🛡️ 𝗥𝗼𝗹𝗲: ${roleText}
│ ⏱️ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${configCommand.countDown || 1}s
│ 👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${configCommand.author || "Unknown"}
│ 💡 𝗨𝘀𝗮𝗴𝗲: ${usage}
╰─────────────────────────────◆`
      );
    }

    if (args[0] === "-a" && args[1]) {
      filterAuthor = args.slice(1).join(" ").toLowerCase();
    } else if (args[0] === "-c" && args[1]) {
      filterCategory = args.slice(1).join(" ").toLowerCase();
    }

    const allCommands = [];
    for (const [name, value] of commands) {
      const config = value.config;
      if (config.role > 1 && role < config.role) continue;
      if (filterAuthor && (config.author?.toLowerCase() !== filterAuthor)) continue;
      if (filterCategory && (config.category?.toLowerCase() !== filterCategory)) continue;
      
      allCommands.push({
        name,
        category: config.category || "Uncategorized"
      });
    }

    if (allCommands.length === 0) {
      const filterMsg = filterAuthor ? `author "${filterAuthor}"` : `category "${filterCategory}"`;
      return message.reply(`❌ No commands found for ${filterMsg}.`);
    }

    allCommands.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });

    const categories = {};
    for (const cmd of allCommands) {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd.name);
    }

    const commandsPerPage = 20;
    const totalPages = Math.ceil(allCommands.length / commandsPerPage);
    let currentPage = 1;

    const generatePage = async (page) => {
      const startIdx = (page - 1) * commandsPerPage;
      const endIdx = Math.min(startIdx + commandsPerPage, allCommands.length);
      const pageCommands = allCommands.slice(startIdx, endIdx);

      const pageCategories = {};
      for (const cmd of pageCommands) {
        if (!pageCategories[cmd.category]) {
          pageCategories[cmd.category] = [];
        }
        pageCategories[cmd.category].push(cmd.name);
      }

      let msg = `╭───────────────◆
│ 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗠𝗘𝗡𝗨
├───────────────●
│ 👤 𝗨𝘀𝗲𝗿: ${(await usersData.get(event.senderID))?.name || "Unknown"}
│ 📄 𝗣𝗮𝗴𝗲: ${page}/${totalPages}
│ 📊 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${allCommands.length}
╰───────────────◆\n`;

      Object.keys(pageCategories).sort().forEach(category => {
        msg += `\n╭─❖ ${category.toUpperCase()} ❖─╮\n`;
        
        const chunkSize = 4;
        const commandList = pageCategories[category];
        
        for (let i = 0; i < commandList.length; i += chunkSize) {
          const chunk = commandList.slice(i, i + chunkSize);
          msg += `│ ${chunk.map(cmd => `🔹 ${cmd}`).join(' '.repeat(6))} ${' '.repeat(6*(chunkSize-chunk.length))}│\n`;
        }
        
        msg += `╰${'─'.repeat(12 + category.length)}╯`;
      });

      msg += `\n\n╭─────────────────────────────◆
│ 📖 𝗨𝘀𝗲 "${prefix}help <command>" 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀
│ 🔄 𝗡𝗮𝘃𝗶𝗴𝗮𝘁𝗲: "${prefix}help page <number>"`;
      
      if (totalPages > 1) {
        msg += `\n│ ⏩ 𝗣𝗮𝗴𝗲𝘀: 1 to ${totalPages}`;
      }
      
      msg += `\n╰─────────────────────────────◆`;

      return msg;
    };

    if (args[0] === "page" && args[1]) {
      const pageNum = parseInt(args[1]);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        return message.reply(`❌ Invalid page number. Please enter a number between 1 and ${totalPages}.`);
      }
      currentPage = pageNum;
    }

    const msg = await generatePage(currentPage);
    await message.reply(msg);
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "🌎 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admins";
    default: return "❓ Unknown Role";
  }
		}
