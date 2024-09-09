import { checkTitleChange, checkStreamStatusChange } from './utils/streamInfo.js';
import { testSendStreamStartNotifications, testSendTitleChangeNotifications } from './utils/notifications.js';
import { getTwitchAccessTokenFromSpreadsheet } from './utils/tokens.js';

import AWS from 'aws-sdk';
const sqs = AWS.SQS();

export const handler = async (event) => {
    try {
        console.log('Processing message:', event);
        // メインの処理
        await testMain();
        
        // 次のメッセージをSQSに送信
        await sendMessageToSqs();
        
        return {
            statusCode: 200,
            body: JSON.stringify('Success'),
        };
    } catch (error) {
        console.error('An error occurred while handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error'),
        };
    }
};

const sendMessageToSqs = async () => {
    const params = {
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify({ message: 'Hello, SQS!'}),
        DelaySeconds: 10 // 10秒後にメッセージを送信
    };
    
    try {
        const result = await sqs.sendMessage(params).promise();
        console.log(`Message sent to SQS with delay of 10 seconds: ${result}`);
    } catch (error) {
        console.error(`An error occurred while processing the message: ${error}`);
    }
};

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchUserId = '605425209';
const twitchUsername = 'oniyadayo';

const testMain = async () => {
    try {
        // accessTokenの取得
        const accessToken = await getTwitchAccessTokenFromSpreadsheet();
        
        // 配信状態の確認
        const isStreamStarted = await checkStreamStatusChange(twitchUserId, accessToken, twitchClientId);
        console.log(`isStreamStarted: ${isStreamStarted}`);
        // trueならば、配信が開始されたことを通知
        if (isStreamStarted) {
            await testSendStreamStartNotifications(twitchUsername);
            console.log('sent start notifications');
        }

        // タイトルの変更を確認
        const { isTitleChanged, currentTitle } = await checkTitleChange(twitchUserId, accessToken, twitchClientId);
        console.log(`isTitleChanged: ${isTitleChanged}`);
        // trueならば、タイトルが変更されたことを通知
        if (isTitleChanged) {
            await testSendTitleChangeNotifications(twitchUsername, currentTitle);
            console.log('sent title change notifications');
        }
        
        return;
    } catch (error) {
        console.error('An error occurred while main function:', error);
    }
};