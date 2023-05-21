const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUsername = 'oniyadayo';
let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

let refreshInterval;
// twitchのアクセストークンをリフッレシュ
refreshInterval = setInterval(refreshAccessToken(twitchClientId, twitchClientSecret, twitchAccessToken, refreshToken, refreshInterval), 1000 * 60 * 30);




setInterval(checkStreamInfo, 1000 * 15); // check every 15 serconds