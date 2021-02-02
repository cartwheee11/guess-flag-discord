const config = require('./config.json');
const Discord = require('discord.js');
const countries = require('./lib/getCountry');
const s2i = require('svg2img');
const fs = require('fs');
const request = require('request');


// let src = 'http://purecatamphetamine.github.io/country-flag-icons/3x2/CV.svg';
// let svg = request(src, {}, function(error, response, body) {
//     s2i(body, function(error, buffer) {
//         fs.writeFileSync('foo3.png', buffer);
//     });
// })

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
        
        let src = `./3x2/${this.currentCountry.alpha2}.svg`

        return new Promise(function(resolve, reject){
            s2i(src, function(error, buffer) {
                if(error) reject(error)
                resolve(buffer);
            });
        }); 
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
        console.log(this.currentCountry);
        return 'На самом деле это ' + country;
    }

    _next() {
        console.log(this.region);
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
                session.getImage().then(image => message.reply('ВЕРНО! Вот новый флаг: ', { files: [ image ] }));
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
                session.getImage().then(image => message.channel.send('Итак, начнем. Что это за флаг?', { files: [ image ] }));
                sessions.set(message.channel.id, session);
            }

            
            
        }
    } else if(command == 'skip') {
        let session = sessions.get(message.channel.id);
        if(session) {
            let ans = session.skip();
            
            session.getImage().then(image => {
                return message.reply(ans + '. Вот новый флаг:', { files: [ image ] })
            })
            
        } else {
            message.reply('Сессия не создана');
        }
    } else if(command == 'stop') {
        let session = sessions.get(message.channel.id);
        if(session) {
            // message.reply('победитель')
            let ans = session.stop();
            message.reply(ans);
            sessions.delete(message.channel.id);
        } else {
            message.reply('Сессия еще не создана');
        }
    } else if(command == 'help') {
        message.reply(
            '\nЧтобы начать игровую сессию на данном канале, введи -flags start.\n\n' +
            'Знаешь правильный ответ? Просто введи его на канале с активной сессией. Не знаешь? Пиши -flags skip или дай подумать другим.\n\n' + 
            'Чтобы прекратить сессию и наконец увидеть игровой счет, введи -flags stop\n\n' +
            'В текстовом канале может быть активна только одна сессия'
        )
    }
});