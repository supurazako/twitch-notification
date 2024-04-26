import fetch from 'node-fetch';

export async function getBroadcasterId(twitchUsername, twitchAccessToken, twitchClientId) {
    const url = `https://api.twitch.tv/helix/users?login=${twitchUsername}`;
    const response = await fetch(url, {
        headers: {
            'Client-ID': twitchClientId,
            'Authorization': `Bearer ${twitchAccessToken}`
        }
    });
    const json = await response.json();
    return json.data[0].id;
}

async function getStreamTitle(twitchUserId, twitchAccessToken, twitchClientId) {
    const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${twitchUserId}`;
  
    return fetch(url, {
        headers: {
            'Client-ID': twitchClientId,
            'Authorization': `Bearer ${twitchAccessToken}`,
        },
    })
        .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
        .then(data => {
        if (data.data.length === 0) {
            throw new Error('Channel not found');
        }
        const streamTitle = data.data[0].title;
        return streamTitle;
    })
      .catch(error => console.error(error));
}

let previousTitle = 'none';
let currentTitle = 'none';
let isInited = false;
let isTitleChanged;

export async function checkTitleChange(twitchUserId, twitchAccessToken, twitchClientId) {
    try {
        let streamTitle = await getStreamTitle(twitchUserId, twitchAccessToken, twitchClientId);
        
        if (streamTitle.length > 0) {
            currentTitle = streamTitle;
            if (currentTitle !== previousTitle) {
                if (isInited == true) {
                    isTitleChanged = true;
                    console.log(`changed to ${currentTitle}`);
                } else {
                    isInited = true;
                    isTitleChanged = false;
                    console.log('Initialization is complete.')
                }
            } else {
                isTitleChanged = false;
                console.log(`nochange, current title: ${currentTitle}`);
            }
        }
        else {
            isTitleChanged = false;
            console.log(`no change, current title: ${currentTitle}`);
        }

        previousTitle = currentTitle;
        return {isTitleChanged, currentTitle};
    } catch (error) {
        console.error(error);
        return {isTitleChanged, currentTitle};
    }
}
