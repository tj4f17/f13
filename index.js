const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const CHANNEL_ID = '1397313325079199816';

function connectToVoiceChannel() {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.error('❌ لم يتم العثور على الروم الصوتي المحدد!');

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log('🔄 تم فصل البوت، جاري إعادة الاتصال...');
        setTimeout(() => connectToVoiceChannel(), 2000);
    });

    console.log(`✅ البوت متصل الآن بالروم: ${channel.name}`);
}

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member.id === client.user.id && newState.channelId !== CHANNEL_ID) {
        console.log('⚠️ تم نقل البوت أو فصله، جاري العودة للروم...');
        connectToVoiceChannel();
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    if (command === 'دي') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('\u200F❌ ليس لديك صلاحية لحظر الأعضاء! \u200E');
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('\u200F❌ ليس لدي صلاحية حظر الأعضاء! \u200E');
        }

        const memberToBan = message.mentions.members.first();
        if (!memberToBan) {
            return message.reply('\u200F⚠️ يرجى منشن الشخص المراد تبنيده! مثال: `دي @user` \u200E');
        }

        if (!memberToBan.bannable) {
            return message.reply('\u200F❌ لا يمكنني حظر هذا العضو، ربما تكون رتبته أعلى من رتبتي! \u200E');
        }

        try {
            await memberToBan.ban({ reason: `بواسطة الأمر من قبل ${message.author.tag}` });
            await message.reply(`\u200F تم حظر العضوˢ: **${memberToBan.user.tag}** \u200E`);
        } catch (error) {
            console.error(error);
            message.reply('\u200F❌ حدث خطأ أثناء محاولة حظر العضو. \u200E');
        }
    }
});

client.once('ready', () => {
    console.log(`✅ البوت متصل باسم: ${client.user.tag}`);
    connectToVoiceChannel();
});

// يتم جلب التوكن بأمان من إعدادات الاستضافة
client.login(process.env.TOKEN);