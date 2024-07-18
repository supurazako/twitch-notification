import fetch from 'node-fetch';

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

let previousTitle = 'none';
let currentTitle = 'none';
let isInited = false;
let isTitleChanged;

export const checkTitleChange = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    try {
        const streamTitle = await getStreamTitle(twitchUserId, twitchAccessToken, twitchClientId);

        if (streamTitle.length > 0) {
            currentTitle = streamTitle;

            if (currentTitle !== previousTitle) {
                if (isInited === true) {
                    isTitleChanged = true;
                    console.log(`changed to ${currentTitle}`);
                } else {
                    isInited = true;
                    isTitleChanged = false;
                    console.log('Initialization is complete.');
                }
            } else {
                isTitleChanged = false;
                console.log(`nochange, current title: ${currentTitle}`);
            }
        } else {
            isTitleChanged = false;
            console.log(`no change, current title: ${currentTitle}`);
        }

        previousTitle = currentTitle;
        return { isTitleChanged, currentTitle };
    } catch (error) {
        console.error('An error occurred while checking title change:', error);
        return { isTitleChanged, currentTitle };
    }
};

let previousStatus = false;
let currentStatus = false;
let isStreamStarted;

export const checkStreamStatusChange = async (twitchUserId, twitchAccessToken, twitchClientId) => {
    try {
        // 配信がオンラインかどうかを確認
        currentStatus = await getStreamStatus(twitchUserId, twitchAccessToken, twitchClientId);

        // 前回がfalseで今回がtrueの場合はtrueを返す。それ以外はfalseを返す
        if (currentStatus === true && previousStatus === false) {
            isStreamStarted = true;
            console.log('Stream started!');
        } else {
            isStreamStarted = false;
            console.log(`Stream not started. currentStatus: ${currentStatus}`);
        }

        previousStatus = currentStatus;
        return isStreamStarted;
    } catch (error) {
        console.error('An error occurred while checking stream status change:', error);
        return false;
    }
}