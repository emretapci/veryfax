const crypto = require('crypto');
const config = require('../config/config.json');

let hash = crypto.createHash('sha256');
const algorithm = 'aes-256-cbc';
hash.update(config.config.cryptoKey.key);
const secretKey = hash.digest('base64').substring(0, 32);
hash = crypto.createHash('sha256');
hash.update(config.config.cryptoKey.iv);
const iv = Buffer.from(hash.digest().slice(16));

const encrypt = plaintext => {
	const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	return encrypted.toString('base64');
};

const decrypt = ciphertext => {
	const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
	const decrpyted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]);
	return decrpyted.toString();
};

module.exports = { encrypt, decrypt };
