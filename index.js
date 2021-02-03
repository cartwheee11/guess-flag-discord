const config = require('./config.json');
const Discord = require('discord.js');
const countries = require('./lib/getCountry');
const s2i = require('svg2img');
const fs = require('fs');
const request = require('request');

let sessions = new Map();

class Player {
    constructor(id) {
        this.id = id;
        this.score = 0;
    }
}

class Session {
    constructor(channelId) {
        this.players = new Map();
        this.channelId = channelId;
        this.currentCountry = '';
        this.region = null;
    }

    start(region) {
        this.region = region;
        this.currentCountry = countries.getRandomCountry(region);

        return this.currentCountry;
    }

    stop() {
        let res = 'Сессия завершена.\n';
        if(this.players.size != 0) {
            res += 'Счет:\n';
            this.players.forEach(function(player) {
                res += player.id + ': ' + player.score + '\n'
            });
        }
        
        return res;
    }

    getImage() {
        return this.currentCountry.flagImage;
    }

    guess(ans, playerId) {
        if(ans.toUpperCase() == this.currentCountry.name.toUpperCase()) {
            if(this.players.get(playerId)){
                this.players.get(playerId).score++;

                this._next();
                return true;
            } else {
                let player = new Player(playerId);
                player.score++;
                this.players.set(playerId, player);

                this._next();
                return true;
            }
        } else {
            return false;
        }
    }

    skip() {
        let country = this.currentCountry.name + '';
        this._next();
        return 'На самом деле это ' + country;
    }

    _next() {
        if(this.region){
            this.currentCountry = countries.getRandomCountry(this.region);
        } else {
            this.this.currentCountry = countries.getRandomCountry();
        }
    }
}

let client = new Discord.Client();


client.login(config.BOT_TOKEN);

const PREFIX = '-flags';

client.on('ready', () => {
    client.user.setActivity('-flags help');
})

client.on('message', message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(PREFIX)) {
        let session = sessions.get(message.channel.id);
        if(session) {
            let ans = session.guess(message.content, message.author.username + '#' + message.author.discriminator);
            if(ans) {
                message.reply('ВЕРНО! Вот новый флаг', { files: [ session.getImage() ] });
                
            } else {
                message.reply('неверно');
            }
        }
    }

    let messageBody = message.content.replace(PREFIX, '').trim();
    let command = messageBody.split(' ')[0];

    if (command == '') {
        
    } else if(command == 'start') {
        let session = sessions.get(message.channel.id)
        if(session){
            message.reply('На этом канале сессия уже запущена');
        } else {

            let region = messageBody.replace(command, '').trim();
            
            
            let session = new Session(message.channel.id);
            let ans;
            (region == '') ? ans = session.start() : ans = session.start(region);

            if(ans instanceof Error) {
                message.reply(ans.message);
                session.stop();
            } else {
                message.channel.send('Итак, начнем. Что это за флаг?', { files: [ session.getImage() ] })
                sessions.set(message.channel.id, session);
            }

            
            
        }
    } else if(command == 'skip') {
        let session = sessions.get(message.channel.id);
        if(session) {
            let ans = session.skip();
            message.reply(ans + '. Вот новый флаг:', { files: [ session.getImage() ] });
           
            
        } else {
            message.reply('Сессия не создана');
        }
    } else if(command == 'stop') {
        let session = sessions.get(message.channel.id);
        if(session) {
            let ans = session.stop();
            message.reply(ans);
            sessions.delete(message.channel.id);
        } else {
            message.reply('Сессия еще не создана');
        }
    } else if(command == 'help') {
        message.reply(
            '\nЧтобы начать игровую сессию на данном канале, введи -flags start или, например, -flags start юго-восточная азия (с уточнением региона).\n\n' +
            'Знаешь правильный ответ? Просто введи его на канале с активной сессией. Не знаешь? Пиши -flags skip или дай подумать другим.\n\n' + 
            'Чтобы прекратить сессию и наконец увидеть игровой счет, введи -flags stop\n\n' +
            'В текстовом канале может быть активна только одна сессия'
        )
    }
});