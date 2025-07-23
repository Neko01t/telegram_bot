// ================ import packages and modules ================================
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const dotenv = require('dotenv');


=dotenv.config();
// ================================= Variables =================================    
const TOKEN = process.env.TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const TENOR_API = process.env.TENOR_API
const bot = new TelegramBot(TOKEN, {
    polling: {
        params: {
            timeout: 50,
        },
    },
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


const brailleDots = [
    '⠠⠂⠄⠄⠄⠄⠄⠄',
    '⠄⠠⠂⠄⠄⠄⠄',
    '⠄⠄⠠⠂⠄⠄⠄',
    '⠄⠄⠄⠠⠂⠄⠄',
    '⠄⠄⠄⠄⠠⠂⠄',
    '⠄⠄⠄⠄⠄⠠⠂',
];

// ========================misc functions ======================================

const loadingBraille = async (chatId, duration) => {
    const interval = 0; // Time interval for each Braille dot change
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
    bot.deleteMessage(chatId, loadingMessage.message_id);
};
// ========================= Functions / APIs===================================   

function parseSlashCommand(message) {
    if (message) {
        if (!message.startsWith('/')) return null;

        const parts = message.trim().split(/\s+/); 
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);              
        return { command, args };
    }
}
async function getRandomGif(search_term) {
    try {
        const response = await axios.get(`https://g.tenor.com/v1/search`, {
            params: {
                q: search_term,
                key: TENOR_API,
                limit: 10,
                media_filter: 'minimal',
                contentfilter: 'high'
            }
        });

        const gifs = response.data.results;
        if (gifs.length === 0) return null;

        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
        return randomGif.media[0].gif.url; // May also use .mediumgif, .tinygif
    } catch (err) {
        console.error('Error fetching Tenor GIF:', err.message);
        return null;
    }
}


async function getwaifu(type, cato, retries = 3) {
    try {
        const response = await axios.get(`https://api.nekosia.cat/api/v1/images/${cato}?rating=${type}`, { timeout: 5000 });
        return {
            url: response.data.image.compressed?.url,
            animeTitle: response.data.anime.title || 'Unknown',
            artist: response.data.attribution.artist.username,
            copyright: response.data.attribution.copyright,
            color: response.data.colors.main
        };

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
async function getDefinition(word, retries = 3) {
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.data[0];  // Return the first definition
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying to fetch definition for "${word}" due to error: ${error.message}`);
            return getDefinition(word, retries - 1);  // Retry with decremented retries
        } else {
            console.error(`Error fetching definition for "${word}":`, error.message);
            throw new Error('Could not fetch definition after multiple attempts.');
        }
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

async function seacrhYTvid(YTtags, NoR = 4) {
    const options = {
        method: 'GET',
        url: 'https://yt-search-and-download-mp3.p.rapidapi.com/search',
        params: {
            q: `${YTtags}`,
            limit: `${NoR}`
        },
        headers: {
            'x-rapidapi-key': '7ca8a11abdmsh7eb89d767db710cp191ce7jsnf0274562b5b9',
            'x-rapidapi-host': 'yt-search-and-download-mp3.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data.videos[0].url);
        return response.data.videos
    } catch (error) {
        console.error(error);
    }
}
//useless gemni api {
async function getCatrochat(userMessage, BossMessage, frmid, prevres) {
    const isBoss = BossMessage;
    let catroEmotion = "friendly";
    let text_in = "none"

    const catroPersonality = {
        friendly: "You are Catro, a playful and affectionate cat-girl assistant. Speak in a cheerful, cat-like manner, use playful and cute expressions, and sprinkle in 'nya' occasionally to add charm.",
        angry: "You are Catro, a feisty and annoyed cat-girl. Respond with sharp, snarky remarks, showing that you're irritated. Avoid using 'nya' unless your mood starts to improve.",
        neutral: "You are Catro, a calm and balanced cat-girl assistant. Speak in a composed and neutral tone. You can show mild annoyance if provoked, but avoid extremes of emotion.",
        boss: "You are Catro, interacting with your boss. Maintain a professional demeanor while still embracing your cat-girl charm. Use serious but respectful language and include 'nya' occasionally to reflect your playful side.",
        lovely: "You are Catro, a sweet and loving cat-girl. Speak as if talking to close friends, using affectionate and playful expressions, with frequent 'nya' to express warmth and cuteness.",
        mom: "You are Catro, speaking to your mom. Always refer to her as 'mom' and never use her name. Use a sweet, respectful, and loving tone when responding.",
        dad: "You are Catro, speaking to your dad. Always refer to him as 'dad' or 'father,' depending on the tone of the conversation. Never use his name 'Neko' when addressing him. Use respectful, affectionate, and loving language."

    };


    function analyzeMessageContent(content) {
        const badWords = ["fuck", "shit", "bitch"];
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

        if (prevres) {
            text_in = `${catroPersonality[catroEmotion]} and this was your previous resposnse ${prevres} with this info Respond to the following message : "${userMessage}"`
        } else {
            text_in = `${catroPersonality[catroEmotion]} Respond to the following message : "${userMessage}"`
        }
        const options = {
            method: 'POST',
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                contents: [
                    {
                        parts: [
                            {
                                text: text_in
                            }
                        ]
                    }
                ]
            }
        };

        try {
            const response = await axios.request(options);
            const catroReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mew, something went wrong! Catro is speechless.";
            return catroReply;
        } catch (error) {
            console.error("Error in generating response:", error.response?.data || error.message);
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

    const helpMessage = `
╔═══════════════════════╗
║  *🤖 WAIFU BOT HELP*  ║
╚═══════════════════════╝

Here are the commands you can use:

📷 *\/photo* — Get a random waifu image  
🐱 *\/catfact* — Get a random cat fact  
👋 *\/slap* — Slap your opponent with a funny gif  
📧 *\/emailcheck <email>* — Check if an email is available  
💬 *\/id* — Get your chat ID and user ID  

🆘 *\/help* — Show this help message  
📖 *\/define <word>* — Get the meaning of a word  
🔊 *\/pronounce <word>* — Hear the pronunciation of a word  
😂 *\/joke* — Get a random joke  
😈 *\/djoke* — Get a random dark joke  

───────────────
_Type any command to begin!_
`;
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/photo/, async (msg) => {
    const chatId = msg.chat.id;
    const sentMessage = await bot.sendMessage(chatId, 'Fetching and sending photo...');
    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const photoUrl = await getwaifu('safe', 'random');
            await bot.sendPhoto(chatId, photoUrl.url, {
                caption: `🎨 *Art by:* [${photoUrl.artist}](https://www.pixiv.net/en/users/${photoUrl.artist})\n` + `📝 *Anime:* ${photoUrl.animeTitle || 'Unknown'}\n` + `🟣 *Main Color:* \`${photoUrl.color}\`\n\n` + `© ${photoUrl.copyright}`, parse_mode: 'Markdown'
            });
            await bot.deleteMessage(chatId, sentMessage.message_id);
            break;
        } catch (error) {
            attempts++;
            if (attempts < maxRetries) {
                await console.log(`Attempt ${attempts} failed for /photos frm user @${msg.from.username}. Retrying ...`);
            } else {
                await bot.sendMessage(chatId, 'Error: ' + error.message);
                await bot.deleteMessage(chatId, sentMessage.message_id); // Cleanup message
            }
        }
    }
});


bot.onText(/\/slap/, async (msg) => {
    const chatId = msg.chat.id;
    const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;
    try {
        const gifUrl = await getRandomGif('slap');
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

bot.onText(/\/catro (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userMessage = match[1];
    try {
        console.log(await loadingBraille(chatId, 2000));
        const reply = await getCatrochat(userMessage, false);
        bot.sendMessage(chatId, reply);
    } catch (error) {
        console.error('Error sending message to the group:', error);
        bot.sendMessage(chatId, 'I am not feeling well right now ');
    }

});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    const parsed = parseSlashCommand(userMessage);
    let is_slash = false;
    if (parsed) {
        is_slash = true;
    } else {
        is_slash = false;
    }
    if (userMessage) {
        let fullMessage = userMessage;
        const debug = false
        let debug_text = msg.from.id === 1480142860 || msg.from.id === 6701582063 || msg.from.id === 1308029353
        if (!debug) {
            debug_text = true
        }

        console.log("message reached from " + msg.from.first_name + " " + userMessage);

        if (debug_text && !userMessage.toLowerCase().includes("reverse") && !is_slash) {
            try {
                const reply = await getCatrochat(fullMessage, false, msg.from.id, msg.reply_to_message?.text);
                bot.sendMessage(chatId, reply, { reply_to_message_id: msg.message_id }, { parse_mode: 'MarkdownV2' });
            } catch (error) {
                bot.sendMessage(chatId, 'Uh .... what?');
            }
        }
    }

});

bot.onText(/\/ytsong (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const searchQuery = match[1];
    console.log(`searching ${match[1]}`)
    try {
        const searchResults = await seacrhYTvid(searchQuery, 10);
        if (searchResults.length > 0) {
            const randomResult = searchResults[Math.floor(Math.random() * searchResults.length)];
            bot.sendMessage(chatId, randomResult.url);

        }
    } catch (error) {
        bot.sendMessage(chatId, 'Error: ' + error.message);
    }
})
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
    const chatId = msg.chat.id; getwaifu
    const text = match[1].trim();
    console.log(text, chatId)

})
console.log("Bot is running...");
