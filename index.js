
import app from './app.js'
import ChatBot from './bot.js'

// import { leerArchivo } from "./utils.js";
// const propmtBase = await leerArchivo("./propmt.txt")

const port = 3000

app.post('/webhook', async (req, res) => {
    const { clientName, msg } = req.body
    const chatBot = new ChatBot("tecnowins", clientName)
    await chatBot.getChatHistory();
    const respuesta = await chatBot.sendMessageUser(msg)
    res.send(respuesta)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})