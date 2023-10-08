let crypto = require('crypto');
let pool = require('./database');
async function generateUniqueToken(user, characterID, coins, precio) {
    try {
        let secretToken = crypto.randomBytes(32).toString('hex');
        await pool.query("INSERT INTO `facturas` (`secretToken`, `IP`, `usuario`, `characterID`, `coins`, `precio`, `estado`, `fecha`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [secretToken, user.lastIP, user.username, characterID, coins, precio, 'En espera', new Date()]);
        return secretToken;
    } catch (error) {
        console.error("Error al insertar en la base de datos:", error);
        throw error; // Puedes lanzar el error para manejarlo en otro lugar si es necesario
    }
}
async function generatePaypalInvoice(user, characterID, coins, precio, payerid) {
    try {
        await pool.query("INSERT INTO `facturas` (`secretToken`, `IP`, `usuario`, `characterID`, `coins`, `precio`, `estado`, `fecha`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [payerid, user.lastIP, user.username, characterID, coins, precio, 'En espera', new Date()]);
        return true;
    } catch (error){
        console.error("Error al insertar en la base de datos:", error)
        throw error;
    }
}
module.exports = { generateUniqueToken, generatePaypalInvoice }