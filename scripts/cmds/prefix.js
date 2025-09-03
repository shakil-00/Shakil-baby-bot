const fs = require("fs-extra");
const { utils } = global;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "prefix",
		version: "1.5",
		author: "Shakil",
		countDown: 5,
		role: 0,
		description: "Change bot command prefix for your chat or system-wide (admin only)",
		category: "config",
		guide: {
			en: "   {pn} <new prefix>: change prefix in your chat"
				+ "\n   Example: {pn} #"
				+ "\n\n   {pn} <new prefix> -g: change system prefix (admin only)"
				+ "\n   Example: {pn} # -g"
				+ "\n\n   {pn} reset: reset to default prefix"
		}
	},

	langs: {
		en: {
			reset: "✅ Your prefix has been reset to default: %1",
			onlyAdmin: "❌ Only admin can change system prefix",
			confirmGlobal: "⚠️ Please react to confirm changing system prefix to: %1",
			confirmThisThread: "⚠️ Please react to confirm changing your chat prefix to: %1",
			successGlobal: "✅ System prefix changed to: %1",
			successThisThread: "✅ Your chat prefix changed to: %1",
			myPrefix: `┌─❖
│ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢
├─❖
│ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗣𝗿𝗲𝗳𝗶𝘅: %1
│ 𝗖𝗵𝗮𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: %2
├─❖
│ 𝗕𝗼𝘁 𝗔𝘂𝘁𝗵𝗼𝗿: %3
│ 𝗗𝗮𝘁𝗲: %4
│ 𝗧𝗶𝗺𝗲: %5
└─❖`
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g") {
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else {
				formSet.setGlobal = true;
				return message.reply(getLang("confirmGlobal", newPrefix), (err, info) => {
					formSet.messageID = info.messageID;
					global.GoatBot.onReaction.set(info.messageID, formSet);
				});
			}
		} else {
			formSet.setGlobal = false;
			return message.reply(getLang("confirmThisThread", newPrefix), (err, info) => {
				formSet.messageID = info.messageID;
				global.GoatBot.onReaction.set(info.messageID, formSet);
			});
		}
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix") {

			const now = moment().tz("Asia/Dhaka");
			const date = now.format('MMMM Do, YYYY');
			const time = now.format('h:mm:ss A');
			
			return message.reply(getLang(
				"myPrefix", 
				global.GoatBot.config.prefix, 
				utils.getPrefix(event.threadID),
				this.config.author,
				date,
				time
			));
		}
	}
};
