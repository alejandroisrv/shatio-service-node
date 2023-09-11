const app = require('./app.js');
const ChatBot = require('./bot.js');
const { sendMessageFacebook } = require('./facebook-api-graph.js');
const logger = require('./logger.js');

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

const chatbot = new ChatBot("tecnowins");

app.post('/w/:path', async (req, res) => {
    const { path } = req.params;
    const { sender, message } = req.body.entry[0].messaging[0];
    const senderId = sender.id;

    let respuesta = '';

    try {
        logger.info(`Mensaje de texto recibido del usuario ${senderId}: ${message.text}`);
        respuesta = await chatbot.call(senderId, message.text);
    } catch (error) {
        logger.error("Error al procesar mensaje del usuario: " + error);
        res.status(500).send('Ha ocurrido un error al procesar mensaje del usuario.');
    }

    try {
        await sendMessageFacebook(senderId, respuesta.text);
        res.status(200).send({ msg: 'Mensaje enviado con exito' });
    } catch (error) {
        logger.error("Error al enviar mensaje FB: " + error);
        res.status(500).send('Ha ocurrido un error al enviar el mensaje a Facebook.');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});