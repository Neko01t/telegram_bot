// ================ import packages and modules ================================
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const dotenv = require('dotenv');

// load environment variables 
dotenv.config();

// ================================= Variables =================================    
const TOKEN = process.env.TOKEN;
console.log(TOKEN);

const bot = new TelegramBot(TOKEN, { polling: true });

// ========================= Functions / APIs===================================    
async function getwaifu(type, cato) {
    try {
        const response = await axios.get(`https://api.waifu.pics/${type}/${cato}`);
        return response.data.url;
    } catch (error) {
        console.error('Error fetching waifu image:', error);
        throw error;
    }
}

async function getNekoImage() {
    const response = await axios.get('https://meowfacts.herokuapp.com/');
    return response.data.data[0];
}

async function getGmailUsername(email) {
    const options = {
        method: 'POST',
        url: 'https://gmail-username-availability-check.p.rapidapi.com/gusername',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'gmail-username-availability-check.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { username: email }
    };
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Error checking Gmail username:', error);
        return { available: false };
    }
}

// ================================== Commands =================================   
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
*Welcome to the Bot!*

Here’s what I can do:
- _Send you random photos, gifs, and stickers_
- _Provide cat facts_
- _Check Gmail username availability_
- _Slap your opponents_

Thank you for using the bot! Enjoy your time!
`;

    bot.sendAnimation(chatId, 'https://imgs.search.brave.com/_pNxoZDfnFkvVGrmXi779AmkH66z7mRuF6EVkUi44BI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS50ZW5vci5jb20v/RXJ6M09Gc29Jdk1B/QUFBTS9iZWxsYS1i/b3QuZ2lm.gif', {
        caption: welcomeMessage,
        parse_mode: 'Markdown'
    });
});
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, '*Hello!* commands we have right now \n /photo - to get random waifu image, \n/catfact - to get random cat fact, \n/slap - to get random slap gif, \n`/emailcheck example@email.com `- to check if email is available, \n /id - to get chat id and user id', { parse_mode: 'Markdown' });
});

bot.onText(/\/photo/, async (msg) => {
    const chatId = msg.chat.id;
    const sentMessage = await bot.sendMessage(chatId, 'Fetching and sending photo...');
    try {
        const photoUrl = await getwaifu('sfw', 'waifu');
        await bot.sendPhoto(chatId, photoUrl);
        await bot.deleteMessage(chatId, sentMessage.message_id);
    } catch (error) {
        bot.sendMessage(chatId, 'Error: ' + error.message);
    }
});

bot.onText(/\/slap/, async (msg) => {
    const chatId = msg.chat.id;
    const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;
    try {
        const gifUrl = await getwaifu('sfw', 'slap');
        await bot.sendAnimation(chatId, gifUrl, { reply_to_message_id: replyToMessageId });
    } catch (error) {
        bot.sendMessage(chatId, 'Error: ' + error.message);
    }
});

bot.onText(/\/catfact/, async (msg) => {
    const chatId = msg.chat.id;
    const catfac = await getNekoImage();
    bot.sendMessage(chatId, catfac);
});

bot.onText(/\/emailcheck (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return bot.sendMessage(chatId, "Please enter a valid email address.");
    }

    try {
        const emailCheckResult = await getGmailUsername(email);
        bot.sendMessage(chatId, emailCheckResult.available ? "This email is available!" : "This email is already in use.");
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, could not check email availability at this time.");
    }
});
// ================================== Group Commands =================================
bot.onText(/\/test (.+)/, async (msg, match) => {
    const chatId = '-4540383907';
    const message = match[1] + '\n\nSent by @' + msg.from.username;
    if (msg.from.id === 1480142860 || msg.from.id === 6701582063) {
        try {
            await bot.sendMessage(chatId, message);
            bot.sendMessage(msg.chat.id, 'Message sent to group!');
        } catch (error) {
            console.error('Error sending message to the group:', error);
            bot.sendMessage(msg.chat.id, 'Failed to send message to the group. Please try again.');
        }
    } else {
        bot.sendMessage(msg.chat.id, 'Only bot owner can use this command!');
    }
});
bot.onText(/\/id/, (msg) => {
    bot.sendMessage(msg.chat.id, `ID of the Chat is ${msg.chat.id}\nID of the User is ${msg.from.id}`);
});

// ----------------------------------------------------------------------------
console.log("Bot is running...");
