require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const getHeadlines = require("./crawler");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
    console.log(`로그인됨: ${client.user.tag}`);
    sendNewsToDiscord();
    setInterval(sendNewsToDiscord, 900000);
});

let lastHeadlines = [];

async function sendNewsToDiscord() {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if (!channel) {
        console.error("채널을 찾을 수 없음");
        return;
    }

    const headlines = await getHeadlines();
    console.log("가져온 헤드라인:", headlines);

    if (Array.isArray(headlines) && headlines.length > 0 && JSON.stringify(headlines) !== JSON.stringify(lastHeadlines)) {
        const limitedHeadlines = headlines.slice(0, 5);
        const embed = new EmbedBuilder()
            .setColor("#1E90FF")
            .setTitle("📰 속보 알림")
            .setDescription(
                "뉴스 헤드라인을 확인하세요\n\n" +
                limitedHeadlines
                    .map((item, index) => `${index + 1}. **[${item.title}](<${item.link}>)**`)
                    .join("\n")
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        lastHeadlines = [...headlines];
    } else if (!Array.isArray(headlines)) {
        console.error(headlines);
    } else if (headlines.length === 0) {
        console.log("속보 없음");
    } else {
        console.log("변경된 속보 없음");
    }
}

client.login(process.env.DISCORD_TOKEN);