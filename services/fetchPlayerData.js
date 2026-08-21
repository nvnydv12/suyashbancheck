const axios = require('axios');

async function fetchPlayerData(uid) {
  try {
    const response = await axios.get(`https://info.bhuwanhex.bond/info?uid=${uid}`);
    if (!response.data || !response.data.playerData) {
      throw new Error('ID NOT FOUND');
    }
    const playerInfo = response.data.playerData;

    return {
      nickname: playerInfo.nickname || 'N/A',
      region: playerInfo.region || 'N/A'
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch player data');
  }
}

module.exports = { fetchPlayerData };
