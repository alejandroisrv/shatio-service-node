const app = require('./app.js');
const ChatBot = require('./bot.js');
const { sendMessageFacebook } = require('./facebook-api-graph.js');

const port = 3000;

app.get('/webhook/:path', (req, res) => {
    const tokenVerificacion = 'stringUnico';
    const { hubMode, hubChallenge, hubVerifyToken } = req.query;
    if (hubMode === 'subscribe' && hubVerifyToken === tokenVerificacion) {
        console.log('Token de verificación correcto.');
        res.status(200).send(hubChallenge);
    } else {
        console.error('Token de verificación incorrecto.');
        res.sendStatus(403);
    }
});

app.post('/webhook/:path', async (req, res) => {
    const { path } = req.params;
    const { sender, message } = req.body.entry[0].messaging[0];
    const senderId = sender.id;

    let respuesta = '';

    try {
        const chatBot = new ChatBot(path, senderId);
        await chatBot.getChatHistory();
        respuesta = await chatBot.getResponseByChatGPT(message.text);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ha ocurrido un error al procesar mensaje del usuario.');
    }

    try {
        const respuestaFB = await sendMessageFacebook(senderId, respuesta);
        res.send({ fb: respuestaFB });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ha ocurrido un error al enviar el mensaje a Facebook.');
    }

    res.send({ msg: 'Mensaje enviado con exito' });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});