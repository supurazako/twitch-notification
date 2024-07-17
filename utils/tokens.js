import fetch from 'node-fetch';
import crypto from 'crypto';
import { getSpreadsheetData, updateSpreadsheetData } from './spreadsheet.js';

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

const getTwitchAccessToken = async () => {
    try {
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: twitchClientId,
                client_secret: twitchClientSecret,
                grant_type: 'client_credentials'
            })
        });

        const data = await response.json();
        return {
            accessToken: data.access_token,
            expiresIn: new Date(Date.now() + data.expires_in * 1000)
        }
    } catch (error) {
        console.error('Error during getiing access token:', error.message);
    }
}

// アクセストークンを取得
export const getTwitchAccessTokenFromSpreadsheet = async () => {
    // スプレッドシートからアクセストークンを取得
    // 格納場所は暫定のため、更新が必要 :TODO
    const spreadsheetRange = 'tokens!A2:B2';
    const response = await getSpreadsheetData(spreadsheetRange);
    console.log(`response: ${response}`);

    // 取得したデータを格納
    const accessToken = response[0];
    const expiresIn = response[1];
    console.log(`accessToken: ${accessToken}, expiresIn: ${expiresIn}`)

    // 有効期限を確認
    const currentTime = new Date();
    const expirationTime = new Date(expiresIn);
    console.log(`currentTime: ${currentTime}, expirationTime: ${expirationTime}`);
    if (currentTime < expirationTime) {
        console.log('Access token has expired');

        // アクセストークンを再取得
        const { accessToken, expiresIn } = await getTwitchAccessToken();
        console.log(`new accessToken: ${accessToken}, new expiresIn: ${expiresIn}`);

        // アクセストークンを暗号化
        const encryptedAccessToken = await encrypto(accessToken);
        console.log(`encryptedAccessToken: ${encryptedAccessToken}`);

        // 復号を確認してみる
        const decryptedAccessToken = await decrypto(encryptedAccessToken);
        console.log(`decryptedAccessToken: ${decryptedAccessToken}`);

        // スプレッドシートに新しいアクセストークン及び有効期限を格納
        // 格納場所は暫定のため、更新が必要 :TODO
        const range = 'tokens!A2:B2';
        const values = [encryptedAccessToken, expiresIn];
        await updateSpreadsheetData(range, values);
        return;

    } else {
        console.log('Access token is valid');
    }
}

// 暗号化処理
const encrypto = async (text) => {
    const algorithm = 'aes-256-cbc';
    const password = process.env.ENCRYPT_PASS;
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
};

// 復号処理
const decrypto = async (text) => {
    const algorithm = 'aes-256-cbc';
    const password = process.env.ENCRYPT_PASS;
    const key = crypto.scryptSync(password, 'salt', 32);

    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
};