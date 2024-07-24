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
const sendDiscordNotification = async (url, content) => {
    // Discord Webhook URL
    const webhookUrl = url;
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

const testPostTweet = async (content) => {
    try {
        const client = new TwitterApi({
            appKey: process.env.TEST_CONSUMER_KEY,
            appSecret: process.env.TEST_CONSUMER_SECRET,
            accessToken: process.env.TEST_ACCESS_TOKEN_KEY,
            accessSecret: process.env.TEST_ACCESS_TOKEN_SECRET
        });
    
        const tweetContent = content;
        client.v2.tweet(tweetContent);
    
        console.log('Tweet posted');
    } catch (error) {
        console.error('An error occurred while posting a tweet:', error);
    }
}

const sendEmail = async (subject, html, recipientMail) => {
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
    const mailOptions = {
        from: senderMailAddress, // 送信元のメールアドレス
        bcc: recipientMail, // 送信先、受信者のメールアドレス
        subject: subject,
        html: html,
    };
    console.log(`mailOptions: ${mailOptions}`);

    // メールを送信
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('メールが送信されました:', info.messageId);
    } catch (error) {
            console.error('メールの送信中にエラーが発生しました', error);
    }
}

export const testSendStreamStartNotifications = async (twitchUsername) => {
    try {
        const date = getDate();
        // discord用のメッセージ
        const discordContent = `<@&1090963184271237251>\n 【配信開始】\n${twitchUsername}さんが配信開始しました！\n開始日時:${date}\nhttps://twitch.tv/${twitchUsername}`;
        const discordWebhookUrl = process.env.TEST_DISCORD_WEBHOOK_URL;
    
        // ツイート用のメッセージ
        const tweetContent = `【配信開始】${twitchUsername}さんが配信開始しました！(開始日時:${date})`;
    
        // メール用のメッセージ
        // TODO: 本番環境では、コメントアウトを外す
        // const spreadsheetRange = `addresses!B2:B`
        // const recipientMail = await getSpreadsheetData(spreadsheetRange);
        const recipientMail = 'redhot30atama@gmail.com';
    
        // メール用のメッセージ
        const mailSubject = `【配信開始】${twitchUsername}さんが配信を開始しました！`;
        const mailHTML = `<p style="font-family: Arial, sans-serif;"><a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${twitchUsername}</a>さんが配信を開始しました！</p>
            <p style="font-family: Arial, sans-serif;">開始日時:${date}</p>
            <br>
            <br>
            <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`;
        
        await sendDiscordNotification(discordWebhookUrl, discordContent);
        await testPostTweet(tweetContent);
        await sendEmail(mailSubject, mailHTML, recipientMail);
    } catch (error) {
        console.error('An error occurred while sending notifications:', error);
    }
}

export const testSendTitleChangeNotifications = async (twitchUsername, currentTitle) => {
    try {
        const date = getDate();
        // discord用のメッセージ
        const discordContent = `<@&1090963184271237251>\n【タイトル変更】\n${twitchUsername}さんが「${currentTitle}」にタイトルを変更しました！\n変更日時:${date}\nhttps://twitch.tv/${twitchUsername}`;
        const discordWebhookUrl = process.env.TEST_DISCORD_WEBHOOK_URL;
    
        // ツイート用のメッセージ
        const tweetContent = `【タイトル変更】${twitchUsername}さんがタイトルを「${currentTitle}」に変更しました(変更日時:${date})`;
    
        // メール用のメッセージ
        // 送信先のアドレスを取得
        // TODO: 本番環境では、コメントアウトを外す
        // const spreadsheetRange = `addresses!B2:B`
        // const recipientMail = await getSpreadsheetData(spreadsheetRange);
        // console.log(`recipientMail: ${recipientMail}`);
        const recipientMail = 'redhot30atama@gmail.com';

        const mailSubject = `【タイトル変更】${twitchUsername}さんがタイトルを変更しました！`;
        const mailHTML = `<p style="font-family: Arial, sans-serif;">${twitchUsername}さんがタイトルを「<a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${currentTitle}</a>」に変更しました！</p>
            <p style="font-family: Arial, sans-serif;">変更日時:${date}</p>
            <br>
            <br>
            <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`;
        
        await sendDiscordNotification(discordWebhookUrl, discordContent);
        await testPostTweet(tweetContent);
        await sendEmail(mailSubject, mailHTML, recipientMail);
    } catch (error) {
        console.error('An error occurred while sending notifications:', error);
    }
}