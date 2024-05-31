import dotenv from 'dotenv';
import fetch from 'node-fetch';
import streamInfo from './utils/streamInfo';
import notifications from './utils/notifications';

dotenv.config();

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUserId = '605425209';
const twitchUsername = 'oniyadayo';
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

const getTwitchAccessToken = async () => {
    try {
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: twitchClientId,
                client_secret: twitchClientSecret,
                grant_type: 'client_credentials'
            })
        });

        const data = await response.json();
        twitchAccessToken = data.access_token;
        setTimeout(getTwitchAccessToken, (24 * 60 * 60 * 1000));
        
    } catch (error) {
        console.error('Error during getiing access token:', error.message);
    }
}

// 配信情報を確認

// twitchAccessTokenをグローバル変数として定義
let twitchAccessToken;

// アクセストークンを取得
getTwitchAccessToken();

let isExecuted = false;

const notificationInterval = async () => {
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
                const schedule = await streamInfo.getSchedule(formattedDate);
                // TODO: sendScheduleNotificationsを実装
                if (schedule !== null) {
                    notifications.sendScheduleNotifications(schedule);
                }
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