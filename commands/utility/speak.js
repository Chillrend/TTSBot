const { SlashCommandBuilder } = require('discord.js');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { AudioPlayerStatus, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, StreamType, createAudioResource } = require('@discordjs/voice');
const { Readable } = require('stream');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('speak')
        .setDescription('Speak!')
        .addStringOption(option => option.setName('text')
            .setRequired(true)
            .setDescription("Your text to be synthesized"))
        .addStringOption(option =>
            option.setName('gender')
                .setDescription('Select synthesizer gender')
                .addChoices(
                    { name: 'Male', value: 'MALE' },
                    { name: 'Female', value: 'FEMALE' }
                )),
    async execute(interaction) {
        let user = await interaction.member.fetch();
        let channel = await user.voice.channel;

        const text = interaction.options.getString('text');
        const gender = interaction.options.getString('gender') || "FEMALE";

        const ttsClient = new TextToSpeechClient();
        const voiceConns = getVoiceConnection(channel.guildId);

        await interaction.reply(`Playing audio for: ${text}!`)

        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: text },
            voice: { name: 'ja-JP-Wavenet-B', languageCode: 'ja-JP', ssmlGender: gender },
            audioConfig: { audioEncoding: 'OGG_OPUS' },
        });

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop,
            },
        });

        voiceConns.subscribe(player);
        
        const audioContent = response.audioContent;
        const bufferStream = new Readable();
        bufferStream._read = () => {}; // No-op
        bufferStream.push(audioContent);
        bufferStream.push(null);

        // Create an audio resource
        const resource = createAudioResource(bufferStream);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Playback finished!');
        });

        player.on('error', error => {
            console.error('Error:', error.message, 'with resource', error.resource.metadata);
        });

    },
};