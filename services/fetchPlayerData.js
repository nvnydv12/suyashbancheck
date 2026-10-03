const axios = require('axios');

function formatTimestamp(ts) {
  if (!ts || ts === '0' || Number(ts) <= 0) return 'N/A';
  try {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' (IST)';
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Fetches real in-game player details (Nickname, Real Level, Likes, Guild, Dates)
 * 1. Checks local engine http://127.0.0.1:5000/check_ban if available
 * 2. Checks live cloud suyashprofileapi.vercel.app/profile
 */
async function fetchPlayerData(uid, region = 'IND') {
  // Option 1: Local engine
  try {
    const localRes = await axios.get(`http://127.0.0.1:5000/check_ban?uid=${encodeURIComponent(uid)}&server_name=${encodeURIComponent(region)}`, {
      timeout: 3000
    });
    if (localRes.data && localRes.data.nickname && localRes.data.status !== 'NOT_FOUND') {
      return {
        uid: String(uid),
        nickname: localRes.data.nickname,
        level: Number(localRes.data.level) || 1,
        likes: Number(localRes.data.likes) || 0,
        exp: Number(localRes.data.exp) || 0,
        guild: localRes.data.guild || 'None',
        region: localRes.data.server || region.toUpperCase(),
        last_login_at: formatTimestamp(localRes.data.last_login_at || localRes.data.lastloginat),
        account_created_at: formatTimestamp(localRes.data.created_at || localRes.data.createat)
      };
    }
  } catch (e) {
    // Continue to cloud API
  }

  // Option 2: Live suyashprofileapi.vercel.app
  try {
    const cloudRes = await axios.get(`https://suyashprofileapi.vercel.app/profile?server=${encodeURIComponent(region)}&uid=${encodeURIComponent(uid)}`, {
      timeout: 7000
    });
    const d = cloudRes.data;
    if (d && d.basicinfo && d.basicinfo.nickname) {
      return {
        uid: String(uid),
        nickname: d.basicinfo.nickname,
        level: Number(d.basicinfo.level) || 1,
        likes: Number(d.basicinfo.liked) || 0,
        exp: Number(d.basicinfo.exp) || 0,
        guild: d.clanbasicinfo ? (d.clanbasicinfo.clanname || 'None') : 'None',
        region: d.basicinfo.region || region.toUpperCase(),
        last_login_at: formatTimestamp(d.basicinfo.lastloginat),
        account_created_at: formatTimestamp(d.basicinfo.createat)
      };
    }
  } catch (e) {
    // Fallback
  }

  return {
    uid: String(uid),
    nickname: 'Player_' + uid,
    level: 1,
    likes: 0,
    exp: 0,
    guild: 'None',
    region: region.toUpperCase(),
    last_login_at: 'N/A',
    account_created_at: 'N/A'
  };
}

module.exports = { fetchPlayerData };
