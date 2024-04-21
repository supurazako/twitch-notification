const { google } = require('googleapis');
const spreadsheetId = process.env.SPREADSHEET_ID;
const spreadsheetName = process.env.SPREADSHEET_NAME;
const serviceAccountMail = process.env.SERVICE_ACCOUNT_MAIL;
const serviceAccountPrivateKey = Buffer.from(process.env.SERVICE_ACCOUNT_PRIVATE_KEY, 'base64');

const range = `${spreadsheetName}!B2:B`; // B列の二行目から最終行までの範囲

// スプレッドシートのデータ取得
async function getAddresses() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: serviceAccountMail,
                private_key: serviceAccountPrivateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client});

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const addresses = response.data.values.flat();
        // console.log(`addresses ${addresses}`);
        return addresses;
    } catch (err) {
        console.error('addressesの取得に失敗しました: ', err);
    }
}

// モジュールとしてエクスポート
module.exports = {
  getAddresses
}
