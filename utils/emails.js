const { google } = require('googleapis');
const spreadsheetId = process.env.SPREADSHEET_ID;
// const spreadsheetName = process.env.SPREADSHEET_NAME;
const serviceAccountMail = process.env.SERVICE_ACCOUNT_MAIL;
const serviceAccountPrivateKey = Buffer.from(process.env.SERVICE_ACCOUNT_PRIVATE_KEY, 'base64');

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
        const range = `addresses!B2:B`; // B列の二行目から最終行までの範囲

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

async function getSchedules() {
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
        const range = `schedule!B2:F`; // B列の二行目からF列の最終行までの範囲

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            // B列の2行目からF列の最終行まで取得
            range: range,
        });

        const schedules = response.data.values;
        // console.log(`schedules ${schedules}`);
        return schedules;
    } catch (err) {
        console.error('schedulesの取得に失敗しました: ', err);
    }
}

// モジュールとしてエクスポート
module.exports = {
    getAddresses,
    getSchedules
}
