import https from 'https';
import { TwitterApi } from 'twitter-api-v2';
import nodemailer from 'nodemailer';
import { getSpreadsheetData } from './spreadsheet.js';

const senderMailAddress = process.env.SENDER_MAIL_ADDRESS;
const senderMailPass = process.env.SENDER_MAIL_PASS;
const unsubscribeMailUrl = process.env.UNSUBSCRIBE_MAIL_URL;

const getDate = () => {
    const currentDate = new Date();
    const options = { timeZone: 'Asia/Tokyo', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return currentDate.toLocaleString('ja-JP', options).replace(/\//g, '-');
}
const sendDiscordNotification = async (content) => {
    // Discord Webhook URL
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    // 送信するメッセージ
    const message = {
        content: content,
    }

    // WebhookにPOSTリクエストを送信
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const req = https.request(webhookUrl, options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(JSON.stringify(message));
    req.end();
}

const postTweet = async (content) => {
    const client = new TwitterApi({
        appKey: process.env.CONSUMER_KEY,
        appSecret: process.env.CONSUMER_SECRET,
        accessToken: process.env.ACCESS_TOKEN_KEY,
        accessSecret: process.env.ACCESS_TOKEN_SECRET
    });

    const tweetContent = content;
    client.v2.tweet(tweetContent);
}

const sendEmail = async (content) => {
    // トランスポーターを作成
    const transporter = nodemailer.createTransport({
        // 使用するメールサービス
        service: 'gmail',
        auth: {
            user: senderMailAddress, // 送信元メールアドレス
            pass: senderMailPass, // 送信元メールのパスワード
        },
    });
    // console.log(`recipient mail ${recipientMail}`);

    const date = getDate();

    // メールのオプションを設定
    const mailOptions = content;
    console.log(`mailOptions: ${mailOptions}`);

    // メールを送信
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('メールが送信されました:', info.messageId);
    } catch (error) {
            console.error('メールの送信中にエラーが発生しました', error);
    }
}

const sendScheduleNotifications = async (schedule) => {
    try {
        // 通知を送る
        sendNotifications
        
    } catch (error) {
        console.error('An error occurred while sending notifications:', error);
    }
}

// const sendTitleChangeNotifications = (twitchUsername, currentTitle) => {
//     // discord用のメッセージ
//     const discordContent = `<@&1090963184271237251> ${twitchUsername}が「${currentTitle}」にタイトルを変更しました！\n変更日時:${date}\nhttps://twitch.tv/${twitchUsername}`;

//     // ツイート用のメッセージ
//     const tweetContent = `${twitchUsername}さんがタイトルを「${currentTitle}」に変更しました(変更日時:${date})`;

//     // メール用のメッセージ
//     const mailContent = {
//         from: senderMailAddress, // 送信元のメールアドレス
//         bcc: recipientMail, // 送信先、受信者のメールアドレス
//         subject: `${twitchUsername}さんがタイトルを変更しました！`,
//         html: `<p style="font-family: Arial, sans-serif;">${twitchUsername}さんがタイトルを「<a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${currentTitle}</a>」に変更しました！</p>
//         <p style="font-family: Arial, sans-serif;">変更日時:${date}</p>
//         <br>
//         <br>
//         <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`,
//     };
    
//     sendDiscordNotification(twitchUsername, currentTitle, discordContent);
//     postTweet(twitchUsername, currentTitle, tweetContent);
//     sendEmail(twitchUsername, currentTitle, mailContent);
// }

// TODO: 配信開始通知を追加
const sendStreamStartNotifications = (twitchUsername) => {
    // discord用のメッセージ
    const discordContent = `<@&1090963184271237251>\n 【配信開始】${twitchUsername}さんが配信開始しました！\n日時:${date}\nhttps://twitch.tv/${twitchUsername}`;

    // ツイート用のメッセージ
    const tweetContent = `${twitchUsername}さんが配信開始しました！(変更日時:${date})`;

    // メール用のメッセージ
    const mailContent = {
        from: senderMailAddress, // 送信元のメールアドレス
        bcc: recipientMail, // 送信先、受信者のメールアドレス
        subject: `${twitchUsername}さんが配信開始しました！`,
        html: `<p style="font-family: Arial, sans-serif;">${twitchUsername}さんがタイトルを「<a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${currentTitle}</a>」に変更しました！</p>
        <p style="font-family: Arial, sans-serif;">変更日時:${date}</p>
        <br>
        <br>
        <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`,
    };
    
    sendDiscordNotification(discordContent);
    postTweet(tweetContent);
    sendEmail(mailContent);
}

const testSendTitleChangeNotifications = async (twitchUsername, currentTitle) => {
    const date = getDate();
    // discord用のメッセージ
    const discordContent = `<@&1090963184271237251> ${twitchUsername}が「${currentTitle}」にタイトルを変更しました！\n変更日時:${date}\nhttps://twitch.tv/${twitchUsername}`;

    // ツイート用のメッセージ
    const tweetContent = `${twitchUsername}さんがタイトルを「${currentTitle}」に変更しました(変更日時:${date})`;

    // メール用のメッセージ
    // 送信先のアドレスを取得
    const spreadsheetRange = `addresses!B2:B`
    let recipientMail = await getSpreadsheetData(spreadsheetRange);
    console.log(`recipientMail: ${recipientMail}`);
    recipientMail = 'redhot30atama@gmail.com';
    console.log(`recipientMail2: ${recipientMail}`)

    const mailContent = {
        from: senderMailAddress, // 送信元のメールアドレス
        bcc: recipientMail, // 送信先、受信者のメールアドレス
        subject: `${twitchUsername}さんがタイトルを変更しました！`,
        html: `<p style="font-family: Arial, sans-serif;">${twitchUsername}さんがタイトルを「<a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${currentTitle}</a>」に変更しました！</p>
        <p style="font-family: Arial, sans-serif;">変更日時:${date}</p>
        <br>
        <br>
        <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`,
    };
    
    // sendDiscordNotification(twitchUsername, currentTitle, discordContent);
    // postTweet(twitchUsername, currentTitle, tweetContent);
    testSendEmail(mailContent);
}

const testSendEmail = async (content) => {
    // トランスポーターを作成
    const transporter = nodemailer.createTransport({
        // 使用するメールサービス
        service: 'gmail',
        auth: {
            user: senderMailAddress, // 送信元メールアドレス
            pass: senderMailPass, // 送信元メールのパスワード
        },
    });

    // メールのオプションを設定
    const mailOptions = content;
    console.log(`mailOptions: ${mailOptions}`)

    // メールを送信
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('メールが送信されました:', info.messageId);
    } catch (error) {
            console.error('メールの送信中にエラーが発生しました', error);
    }
}

export default {
    sendStreamStartNotifications,
    testSendTitleChangeNotifications
}