function sendNotifications(twitchUsername, currentTitle) {
    sendDiscordNotification(twitchUsername, currentTitle);
    postTweet(twitchUsername, currentTitle);
    sendEmail(twitchUsername, currentTitle);
}

const getDate = () => {
    const currentDate = new Date();
    const options = { timeZone: 'Asia/Tokyo', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return currentDate.toLocaleString('ja-JP', options).replace(/\//g, '-');
}

async function sendDiscordNotification(twitchUsername, currentTitle) {
    const https = require('https');
    
    // Discord Webhook URL
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
    const date = getDate();
    // 送信するメッセージ
    const message = {
        content: `<@&1090963184271237251> ${twitchUsername}が「${currentTitle}」にタイトルを変更しました！\n変更日時:${date}\nhttps://twitch.tv/${twitchUsername}`
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


async function postTweet(twitchUsername, currentTitle) {
    const { TwitterApi } = require('twitter-api-v2');

    const date = getDate();

    const client = new TwitterApi({
        appKey: process.env.CONSUMER_KEY,
        appSecret: process.env.CONSUMER_SECRET,
        accessToken: process.env.ACCESS_TOKEN_KEY,
        accessSecret: process.env.ACCESS_TOKEN_SECRET
    });

    const tweetContent = `${twitchUsername}さんがタイトルを「${currentTitle}」に変更しました(変更日時:${date})`;
    client.v2.tweet(tweetContent);
}

const nodemailer = require('nodemailer');
const emails = require('./emails');

const senderMailAddress = process.env.SENDER_MAIL_ADDRESS;
const senderMailPass = process.env.SENDER_MAIL_PASS;
const unsubscribeMailUrl = process.env.UNSUBSCRIBE_MAIL_URL;

async function sendEmail(twitchUsername, currentTitle) {
    // トランスポーターを作成
    const transporter = nodemailer.createTransport({
        // 使用するメールサービス
        service: 'gmail',
        auth: {
            user: senderMailAddress, // 送信元メールアドレス
            pass: senderMailPass, // 送信元メールのパスワード
        },
    });
    // 送信先のアドレスを取得
    const recipientMail = await emails.getAddresses();

    // console.log(`recipient mail ${recipientMail}`);

    const date = getDate();

    // メールのオプションを設定
    const mailOptions = {
        from: senderMailAddress, // 送信元のメールアドレス
        to: recipientMail, // 送信先、受信者のメールアドレス
        subject: `${twitchUsername}さんがタイトルを変更しました！`,
        html: `<p style="font-family: Arial, sans-serif;">${twitchUsername}さんがタイトルを「<a href="https://twitch.tv/${twitchUsername}" style="color: blue;">${currentTitle}</a>」に変更しました！</p>
        <p style="font-family: Arial, sans-serif;">変更日時:${date}</p>
        <br>
        <br>
        <p style="font-family: Arial, sans-serif;">メール配信停止は<a href="${unsubscribeMailUrl}" style="color: blue;">こちら</a></p>`,
    };

    // メールを送信
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('メールが送信されました:', info.messageId);
    } catch (error) {
            console.error('メールの送信中にエラーが発生しました', error);
    }
}


module.exports = {
    sendNotifications,
    getDate
}