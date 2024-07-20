import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const spreadsheetId = process.env.SPREADSHEET_ID;
const serviceAccountMail = process.env.SERVICE_ACCOUNT_MAIL;
const serviceAccountPrivateKey = Buffer.from(process.env.SERVICE_ACCOUNT_PRIVATE_KEY, 'base64');

// スプレッドシートのデータ取得
export const getSpreadsheetData = async (range) => {
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

        const data = response.data.values.flat();
        return data;
    } catch (err) {
        console.error('Failed to fetch spreadsheet data: ', err);
    }
}

// スプレッドシートのデータ更新
export const updateSpreadsheetData = async (range, values) => {
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

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] },
        });
        
        console.log('Data updated successfully');
        return;
    } catch (err) {
        console.error('Failed to update spreadsheet data: ', err);
    }
}