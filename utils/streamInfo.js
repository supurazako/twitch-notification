import fetch from 'node-fetch';
import { getSpreadsheetData, updateSpreadsheetData } from './spreadsheet.js';

const getStreamTitle = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${twitchUserId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Client-ID': twitchClientId,
                'Authorization': `Bearer ${twitchAccessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data.length === 0) {
            throw new Error('Channel not found');
        }

        const streamTitle = data.data[0].title;
        return streamTitle;
    } catch (error) {
        console.error('An error occurred while getting stream title:', error);
        throw error;
    }
};

const getStreamStatus = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    const url = `https://api.twitch.tv/helix/streams?user_id=${twitchUserId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Client-ID': twitchClientId,
                'Authorization': `Bearer ${twitchAccessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data.length === 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('An error occurred while getting stream status:', error);
        throw error;
    }
}

export const checkTitleChange = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    try {
        // タイトルを取得
        // const currentTitle = await getStreamTitle(twitchUserId, twitchAccessToken, twitchClientId);
        // const previousTitle = await getSpreadsheetData('utils!B1');

        // テスト用
        const currentTitle = 'test title';
        const previousTitle = 'test title2';

        let isTitleChanged;

        if (previousTitle !== null) {
            if (currentTitle !== previousTitle) {
                isTitleChanged = true;
                console.log(`changed to ${currentTitle}`);
            } else {
                isTitleChanged = false;
                console.log(`nochange, current title: ${currentTitle}`);
            }
        } else {
            isTitleChanged = false;
            console.log('title is not set');
        }

        return { isTitleChanged, currentTitle };
    } catch (error) {
        console.error('An error occurred while checking title change:', error);
        return { isTitleChanged, currentTitle };
    }
};


export const checkStreamStatusChange = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    try {
        // isStreamStartedを初期化
        let isStreamStarted;

        // 配信がオンラインかどうかを確認
        // const currentStatus = await getStreamStatus(twitchUserId, twitchAccessToken, twitchClientId);
        
        // テスト用
        const currentStatus = true;

        // 前回の状態を取得
        const previousStatus = await getSpreadsheetData('utils!B2');

        // 前回がfalseで今回がtrueの場合はtrueを返す。それ以外はfalseを返す
        if (currentStatus === true && previousStatus === false) {
            isStreamStarted = true;
            console.log('Stream started!');
        } else {
            isStreamStarted = false;
            console.log(`Stream not started. currentStatus: ${currentStatus}`);
        }

        // previousStatusを更新
        await updateSpreadsheetData('utils!B2', [currentStatus]);
        return isStreamStarted;
    } catch (error) {
        console.error('An error occurred while checking stream status change:', error);
        return false;
    }
}