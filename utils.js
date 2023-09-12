const fs = require('fs/promises');

const leerArchivo = async (ruta) => {
    
    if (!fs.existsSync(ruta)) {
        console.error('El archivo no existe:', ruta);
        return null;
    }

    try {
        const contenido = await fs.readFile(ruta, 'utf8');
        return contenido;
    } catch (error) {
        console.error('No se ha podido leer el archivo', ruta);
        return null;
    }
};

const escribirArchivo = async (ruta, contenido) => {
    try {
        await fs.writeFile(ruta, contenido);
    } catch (error) {
        console.error('No se ha podido escribir el archivo', ruta);
        console.error(error);
    }
};

module.exports = { leerArchivo, escribirArchivo };