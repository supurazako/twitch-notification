import dotenv from 'dotenv';
import fetch from 'node-fetch';
import streamInfo from './utils/streamInfo';
import notifications from './utils/notifications';

dotenv.config();

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUsername = 'oniyadayo';
let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

let refreshInterval;


const refreshAccessToken = async () => {
    try{
        const refreshTokenUrl = `https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${twitchClientId}&client_secret=${twitchClientSecret}`;
        const response = await fetch(refreshTokenUrl, { method: 'POST' });
        const data = await response.json();
        twitchAccessToken = data.access_token;
        console.log(`Access token refreshed: ${twitchAccessToken}`);
    } catch (error) {
        console.error('An error occurred while refreshin access token:', error);
    }
};
  
refreshInterval = setInterval(refreshAccessToken, 1000 * 60 * 30);


// setInterval(refreshAccessToken(twitchClientId, twitchClientSecret, twitchAccessToken, refreshToken), 1000 * 60 * 30);
// 上の場合だとエラーになる

// 配信情報を確認

// getBroadcasterIdは非同期関数(async function)だから.thenで処理するか、awaitキーワードを使用できる関数内で実行する必要がある
let twitchUserId;

streamInfo.getBroadcasterId(twitchUsername, twitchAccessToken, twitchClientId)
    .then(result => {
        twitchUserId = result;
        console.log(`result: ${result}`);
    })
    .catch(error => {
        console.error(error);
    });
console.log(`twitchUserId: ${twitchUserId}`);

let isExecuted = false;

async function notificationInterval() {
    try {
        // 戻り値を取得
        const { isTitleChanged, currentTitle } = await streamInfo.checkTitleChange(twitchUserId, twitchAccessToken, twitchClientId);
        if (isTitleChanged == true) {
            try {
                // 通知を送る
                notifications.sendNotifications(twitchUsername, currentTitle);
                console.log('sent notifications');
            } catch (error) {
                console.error('An error occurred while sending notifications:', error);
            }
        }
        const options = { timeZone: 'Asia/Tokyo', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false};
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedDate = formatter.format(new Date());
        const currentHour = formattedDate.getHours();
        const currentMinute = formattedDate.getMinutes();
        // 未実行で、8時ならば予定を取得して、通知を送る
        if (isExecuted == false) {
            if (currentHour == 8 && currentMinute == 0) {
                const schedule = await streamInfo.getSchedule(twitchUserId, twitchAccessToken, twitchClientId);
                // TODO: sendScheduleNotificationsを実装
                notifications.sendScheduleNotifications(twitchUsername, schedule);
                isExecuted = true;
            }
        } else {
            // ８時５分になったら、実行フラグをfalseにする
            if (currentHour == 8 && currentMinute == 5)
                isExecuted = false;
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


setInterval(notificationInterval, 1000 * 10);

// async function notificationTest() {
//     try {
//         // 戻り値を取得
//         let isFirst = false;
//         const currentTitle = 'Test 悲報、おにや寝ぐせがひどい'
//         if (isFirst == false) {
//             try {
//                 // 日時を YY-MM-DD HH:MM の形式で取得
//                 const currentDate = new Date();
//                 const options = { timeZone: 'Asia/Tokyo', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
//                 const formattedDate = currentDate.toLocaleString('ja-JP', options).replace(/\//g, '-');
//                 // console.log(`現在時刻 ${formattedDate}`);
                

//                 // 通知を送る
//                 notifications.sendNotifications(twitchUsername, currentTitle, formattedDate);
//                 console.log('sent notifications');
//             } catch (error) {
//                 console.error('An error occurred while sending notifications:', error);
//             }
//         }   
//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
// }

// notificationTest();
