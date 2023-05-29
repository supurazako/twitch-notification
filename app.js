const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUsername = 'oniyadayo';
let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

let refreshInterval;
const refreshAccessToken = require('./utils/refreshAccessToken');
const checkTitleChange = require('./utils/streamInfo');
// twitchのアクセストークンをリフッレシュ
refreshInterval = setInterval(refreshAccessToken(twitchClientId, twitchClientSecret, twitchAccessToken, refreshToken, refreshInterval), 1000 * 60 * 30);

// 配信情報を確認
const checkTitleChange = require('./utils/streamInfo');
const sendNotifications = require('./utils/notifications');

setInterval (() => {
    const result = checkTitleChange(twitchUsername, twitchAccessToken, twitchClientId); // 戻り値を取得
    if (result.isTitleChanged == true) {
        // 通知を送る
        sendNotifications(twitchUsername, result.currentTitle);

    }
}, 1000 * 15);