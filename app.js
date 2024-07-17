import dotenv from 'dotenv';
import streamInfo from './utils/streamInfo.js';
import notifications from './utils/notifications.js';
import { getTwitchAccessTokenFromSpreadsheet } from './utils/tokens.js';

dotenv.config();

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUserId = '605425209';
const twitchUsername = 'oniyadayo';

// TODO: 配信が開始されたら通知を送る

const notificationInterval = async () => {
    try {
        // 配信状態を確認
        const isStreamStarted = await streamInfo.checkStreamStatusChange(twitchUserId, twitchAccessToken, twitchClientId);
        if (isStreamStarted == true) {
            // 配信が開始されたら通知を送る
            notifications.sendNotifications(twitchUsername, '配信が開始されました');
            console.log('sent notifications');
        }
        // タイトルの変更を確認
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
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

const testMain = async () => {
    try {
        // notifications.testSendTitleChangeNotifications(twitchUsername, 'test title');
        await getTwitchAccessTokenFromSpreadsheet();
        process.exit(0);
    } catch (error) {
        console.error('An error occurred while sending notifications:', error);
    }
}

// 新しい実行フロー
// 1. アクセストークンをGSから取得
// 2. 通知の条件分岐を行う

testMain();