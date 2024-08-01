const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a voice channel'),
    async execute(interaction) {
        let user = await interaction.member.fetch();
        let channel = await user.voice.channel;

        if(channel){
            await interaction.reply('You are in a voice channel!');
        }else{
            await interaction.reply('You are NOT in a voice channel!');
        }
    },
};