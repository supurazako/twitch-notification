const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUsername = 'oniyadayo';
let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

let refreshInterval;
const refreshAccessToken = require('./utils/refreshAccessToken');
const checkStreamInfo = require('./utils/streamInfo');
// twitchのアクセストークンをリフッレシュ
refreshInterval = setInterval(refreshAccessToken(twitchClientId, twitchClientSecret, twitchAccessToken, refreshToken, refreshInterval), 1000 * 60 * 30);

// 配信情報を確認
const checkStreamInfo = require('./utils/streamInfo');
const sendDiscordNotification = require('./utils/notifications');
const postTweet = require('./utils/notifications');

setInterval (() => {
    const result = checkStreamInfo(twitchUsername, twitchAccessToken, twitchClientId); // 戻り値を取得
    if (result == true) {
        // 通知を送る
        sendDiscordNotification(twitchUsername, currentTitle);
        postTweet(twitchUsername, currentTitle);

    }
}, 1000 * 15);