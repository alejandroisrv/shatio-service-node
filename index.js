const app = require('./app.js');
const ChatBot = require('./bot.js');
const { sendMessageFacebook } = require('./facebook-api-graph.js');

const port = 3000;

app.get('/w/:page', (req, res) => {
    console.log('GET: webhook');

    const VERIFY_TOKEN = 'stringUnicoParaTuAplicacion';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK VERIFICADO');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

app.post('/w/:path', async (req, res) => {
    const { path } = req.params;
    const { sender, message } = req.body.entry[0].messaging[0];
    const senderId = sender.id;

    let respuesta = '';

    const chatBot = new ChatBot(path, senderId);
    await chatBot.getChatHistory();
    await chatBot.getPrompt();

    console.error(req.body)

    respuesta = await chatBot.getResponseByChatGPT(message.text);

    if (respuesta === null) {
        console.error('Se ha producido un error al obtener la respuesta del bot');
        return res.status(500).send('Ha ocurrido un error al procesar mensaje del usuario.');
    }

    try {
        const respuestaFB = await sendMessageFacebook(senderId, respuesta);
        return res.send({ fb: respuestaFB });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Ha ocurrido un error al enviar el mensaje a Facebook.');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});