
const sendMessageFacebook = async (senderId, respuesta) => {
    const accessToken = process.env.ACCESS_TOKEN_FB;
    const endpoint = `https://graph.facebook.com/v17.0/me/messages?access_token=${accessToken}`;
    const body = {
        recipient: { id: senderId },
        message: { text: respuesta },
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    const rs = await fetch(endpoint, options);
    const datos = await rs.json();
    return datos;
};

module.exports = { sendMessageFacebook };