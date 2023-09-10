import fs from 'fs/promises';

export const leerArchivo = async (ruta) => {

    try {
        const contenido = await fs.readFile(ruta, 'utf8');
        return contenido;
    } catch (error) {
        console.error("No se ha podido leer el archivo", ruta);
        return null
    }
}

export const escribirArchivo = async (ruta, contenido) => {
    try {
        await fs.writeFile(ruta, contenido)
    } catch (error) {
        console.error("No se ha podido escribir el archivo", ruta);
        console.error(error)
    }
}