import axios from "axios"
import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 5000

const bot = new Telegraf(process.env.TG_TOKEN)

bot.start((ctx) => ctx.reply(`
    Hey! Please send me a link to the tik tok video, i'll remove a watermark.
`))

bot.on(message('text'), async (ctx) => {
    const userURL = ctx.message.text;
    const urlRegex = /(https?:\/\/[^\s]+)/;
    if (urlRegex.test(userURL)) {
        useAPI(userURL, ctx)
    } else {
        await ctx.reply('Provide me a link (URL format).');
    }
})

bot.launch()

const useAPI = async(url, ctx) => {
    await ctx.reply("Loading...")
    const options = {
        method: 'GET',
        url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        params: {
            url: url,
            hd: '1'
        },
        headers: {
            'X-RapidAPI-Key': process.env.API_TOKEN,
            'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com'
        }
    };

    try {
        const request = await axios.request(options)
        const { data } = request.data
        if (!data) {
            return await ctx.reply("An error has occurred, check the validity of the link or make sure that the video is available.")
        }
        const { hdplay } = data
        await ctx.replyWithMarkdown(`I'm ready! [Click here](${hdplay}) to download video without watermarks.`);
    } catch (err) {
        console.log(err)
        await ctx.reply("Couldn't delete the watermark, try again...")
    }
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

app.listen(port, () => {
    console.log("Server has started on port " + port)
})