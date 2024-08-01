const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a voice channel'),
    async execute(interaction) {
        let user = await interaction.member.fetch();
        let channel = await user.voice.channel;

        if(!channel){
            await interaction.reply('You are NOT in a voice channel!');
            return
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        await interaction.reply(`Connected to Voice Channel: ${channel.name}`);
    },
};