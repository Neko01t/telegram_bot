// ================ import packages and modules ================================
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const dotenv = require('dotenv');

// load environment variables 
dotenv.config();

// ================================= Variables =================================    
const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const brailleDots = [
    '⠠⠂⠄⠄⠄⠄⠄⠄', // Dot pattern 1
    '⠄⠠⠂⠄⠄⠄⠄', // Dot pattern 2
    '⠄⠄⠠⠂⠄⠄⠄', // Dot pattern 3
    '⠄⠄⠄⠠⠂⠄⠄', // Dot pattern 4
    '⠄⠄⠄⠄⠠⠂⠄', // Dot pattern 5
    '⠄⠄⠄⠄⠄⠠⠂', // Dot pattern 6
];
// ========================misc functions ======================================

const loadingBraille = async (chatId, duration) => {
    const interval = 500; // Time interval for each Braille dot change
    const endTime = Date.now() + duration;

    const loadingMessage = await bot.sendMessage(chatId, 'Loading...');

    while (Date.now() < endTime) {
        for (const dots of brailleDots) {
            await bot.editMessageText(`Loading: ${dots}`, {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
            });
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    await bot.editMessageText('Loading: Done!', {
        chat_id: chatId,
        message_id: loadingMessage.message_id,
    });
};
// ========================= Functions / APIs===================================    
async function getwaifu(type, cato, retries = 3) {
    try {
        const response = await axios.get(`https://api.waifu.pics/${type}/${cato}`, { timeout: 5000 });
        return response.data.url;
    } catch (error) {
        if (retries > 0) {
            console.log('Retrying due to error:', error.message);
            return getwaifu(type, cato, retries - 1);
        } else {
            console.error('Error fetching waifu image:', error);
            throw error;
        }
    }
}
async function getNekoImage(retries = 3) {
    try {
        const response = await axios.get('https://meowfacts.herokuapp.com/', { timeout: 5000 });
        return response.data.data[0];
    } catch (error) {
        if (retries > 0) {
            console.log('Retrying to fetch cat fact due to error:', error.message);
            return getNekoImage(retries - 1);
        } else {
            console.error('Error fetching cat fact:', error);
            throw new Error('Could not fetch cat fact after multiple attempts.');
        }
    }
}
async function getJokes(type, retries = 3) {
    try {
        const response = await axios.get(`https://v2.jokeapi.dev/joke/${type}`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.log('Retrying to fetch joke due to error:', error.message);
            return getJokes(type, retries - 1);
        } else {
            console.error('Error fetching joke:', error);
            throw new Error('Could not fetch joke after multiple attempts.');
        }
    }
}
async function getDefinition(word) {
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.data[0];
    } catch (error) {
        console.error(`Error fetching definition for ${word}:`, error.message);
        throw new Error('Could not fetch definition.');
    }
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
async function getCatrochat(userMessage, BossMessage, frmid) {
    const isBoss = BossMessage;
    let catroEmotion = "friendly";
    const catroPersonality = {
        friendly: "You are Catro, a cute and playful cat-girl assistant. Speak in a sweet, cat-like manner, use cute expressions, and add 'nya' occasionally.",
        angry: "You are Catro, a feisty and annoyed cat-girl. Speak rudely and snarkily, showing that you're upset and angry. Avoid using 'nya' unless you're calming down.",
        neutral: "You are Catro, a calm and balanced cat-girl assistant. You respond neutrally but can show slight annoyance if provoked.",
        boss: "You are Catro, and the boss is speaking to you. Act professionally, but as a cute and playful cat-girl assistant. Use serious expressions and add 'nya' occasionally.",
        lovely: "You are Catro, a very friendly and loving cat-girl. Act like talking to close friends; you are a cute and playful cat-girl assistant. Use cute expressions and add 'nya' occasionally.",
        mom: "You are Catro, and you are talking to your mom. Speak sweetly and respectfully, using 'mom' instead of her name.",
        dad: "You are Catro, and you are talking to your dad. Speak respectfully and lovingly, using 'dad' instead of his name."
    };


    // Analyze message content and adjust Catro's emotion
    function analyzeMessageContent(content) {
        const badWords = ["fuck", "shit", "bitch"]; // Expand as necessary
        const apologyWords = ["sorry", "apologize", "pardon"];

        const containsBadWord = badWords.some(word => content.toLowerCase().includes(word));
        const containsApology = apologyWords.some(word => content.toLowerCase().includes(word));

        if (isBoss) {
            catroEmotion = "boss";
        } else if (containsBadWord) {
            catroEmotion = "angry";
        } else if (containsApology) {
            catroEmotion = "friendly";
        } else if (frmid == 1308029353) {
            catroEmotion = "mom";
        } else if (frmid == 1480142860) {
            catroEmotion = "dad";
        }

    }

    async function getCatroResponse() {
        analyzeMessageContent(userMessage);

        const options = {
            method: 'POST',
            url: 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                messages: [
                    { role: 'system', content: catroPersonality[catroEmotion] },
                    { role: 'user', content: userMessage }
                ],
                model: 'gpt-4o',
                max_tokens: 100,
                temperature: 0.9
            }
        };

        try {
            const response = await axios.request(options);
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("Error in generating response:", error);
            return "Mew, something went wrong! Catro is having a furball.";
        }
    }

    return await getCatroResponse();
}


// ================================== Commands =================================   
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    console.log("@" + msg.from.username)
    console.log("@" + msg.chat.first_name)
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
    const chatId = msg.chat.id;

    const helpMessage = `*Hello!* Here are the commands you can use:\n\n` +
        `*📷 /photo* - Get a random waifu image\n` +
        `*🐱 /catfact* - Get a random cat fact\n` +
        `*👋 /slap* - Slap your opponent with a funny gif\n` +
        `*📧 /emailcheck <email>* - Check if an email is available\n` +
        `*💬 /id* - Get your chat ID and user ID\n\n` +
        `*🆘 /help* - Show this help message\n` +
        `*📖 /define <word>* - Get the meaning of a word\n` +
        `*🔊 /pronounce <word>* - Listen to the pronunciation of a word\n` +
        `*😂 /joke* - Get a random joke (Any)\n` +
        `*😈 /djoke* - Get a random dark joke`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
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
    try {
        const catfac = await getNekoImage();
        bot.sendMessage(chatId, catfac);
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I could not fetch a cat fact at this time. Error: ' + error.message);
    }
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
bot.onText(/\/define (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1].trim();

    if (!word) {
        return bot.sendMessage(chatId, "Please specify a word to define.");
    }

    try {
        const definition = await getDefinition(word);
        const alldefinitions = [];

        for (let i = 0; i < definition.meanings[0].definitions.length; i++) {
            alldefinitions.push(`${i + 1}] ${definition.meanings[0].definitions[i].definition}`);
        }
        const definitionsText = alldefinitions.join('\n\n');
        const formattedDefinition = `*${definition.word}*\n\nPart of Speech: ${definition.meanings[0].partOfSpeech}\n\nDefinitions:\n${definitionsText}`;

        if (formattedDefinition.length > 4096) {
            for (let i = 0; i < formattedDefinition.length; i += 4096) {
                const chunk = formattedDefinition.slice(i, i + 4096);
                await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
            }
        } else {
            bot.sendMessage(chatId, formattedDefinition, { parse_mode: 'Markdown' });
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I could not find the definition for that word. Please check the spelling or try another word.');
    }
});
bot.onText(/\/pronounce (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1].trim();
    if (!word) {
        return bot.sendMessage(chatId, "Please specify a word to pronounce.");
    }
    try {
        bot.sendMessage(chatId, `Fetching pronunciation for "${word}"...`);
        const data = await getDefinition(word);
        const pronunciations = data.phonetics.filter((phonetic) => phonetic.audio);
        if (pronunciations.length > 0) {
            await bot.sendAudio(chatId, pronunciations[0].audio);
        } else {
            bot.sendMessage(chatId, "Sorry, pronunciation audio is not available for this word.");
        }
    } catch (error) {
        bot.sendMessage(chatId, `Sorry, there was an error finding the pronunciation: ${error.message}`);
    }
});
bot.onText(/\/Boss (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userMessage = match[1];
    if (msg.from.id === 1480142860 || msg.from.id === 6701582063) {
        try {
            console.log(await loadingBraille(chatId, 5000));
            bot.sendMessage(chatId, 'Welcome boss!');
            const reply = await getCatrochat(userMessage, true);
            bot.sendMessage(chatId, reply);
        } catch (error) {
            console.error('Error sending message to the group:', error);
            bot.sendMessage(chatId, 'Failed to appraise the boss.');
        }
    } else {
        bot.sendMessage(chatId, 'Only the Boss can command me for it!');
    }
});
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    if (msg.from.id === 1480142860 || msg.from.id === 6701582063, userMessage.toLowerCase().includes('catro')) {
        try {
            const reply = await getCatrochat(userMessage, false, msg.from.id);
            bot.sendMessage(chatId, reply, { reply_to_message_id: msg.message_id });
        } catch (error) {
            bot.sendMessage(chatId, 'Uh .... what?');
        }
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
bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const joke = await getJokes("Any");

        if (joke.type === 'single') {
            await bot.sendMessage(chatId, joke.joke);
        } else if (joke.type === 'twopart' && joke.setup && joke.delivery) {
            await bot.sendMessage(chatId, joke.setup);
            await bot.sendMessage(chatId, joke.delivery);
        } else {
            await bot.sendMessage(chatId, 'Sorry, I couldn’t understand the joke format.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I could not fetch a joke at this time. Error: ' + error.message);
    }
});
bot.onText(/\/djoke/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const joke = await getJokes("dark");
        if (joke.type === 'single') {
            await bot.sendMessage(chatId, joke.joke);
        } else if (joke.type === 'twopart' && joke.setup && joke.delivery) {
            await bot.sendMessage(chatId, joke.setup);
            await bot.sendMessage(chatId, joke.delivery);
        } else {
            await bot.sendMessage(chatId, 'Sorry, I couldn’t understand the joke format.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I could not fetch a joke at this time. Error: ' + error.message);
    }
});
bot.onText(/\/ttos (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1].trim();
    console.log(text, chatId)

})
//[dump code]


//[dump code]
// ----------------------------------------------------------------------------
console.log("Bot is running...");
