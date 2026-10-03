const axios = require('axios');

function formatTimestamp(ts) {
  if (!ts || ts === '0' || ts === 'N/A') return 'N/A';
  if (typeof ts === 'string' && isNaN(Number(ts))) return ts;
  try {
    const num = Number(ts);
    const d = new Date(num > 1e11 ? num : num * 1000);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString('en-IN', {
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
    return String(ts);
  }
}

function parseDateToMs(ts) {
  if (!ts || ts === '0' || ts === 'N/A') return null;
  if (!isNaN(Number(ts))) {
    const num = Number(ts);
    return num > 1e11 ? num : num * 1000;
  }
  try {
    const clean = String(ts).replace(/\s*\([A-Z]+\)\s*$/, '').replace(' at ', ' ');
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d.getTime();
  } catch (e) {
    return null;
  }
}

async function fetchPlayerData(uid, region = 'IND') {
  // Option 1: Local engine
  try {
    const localRes = await axios.get('http://127.0.0.1:5000/check_ban?uid=' + encodeURIComponent(uid) + '&server_name=' + encodeURIComponent(region), {
      timeout: 3000
    });
    if (localRes.data && localRes.data.nickname && localRes.data.status !== 'NOT_FOUND') {
      const lastLoginStr = localRes.data.last_login_at || localRes.data.lastloginat;
      return {
        uid: String(uid),
        nickname: localRes.data.nickname,
        level: Number(localRes.data.level) || 1,
        likes: Number(localRes.data.likes) || 0,
        exp: Number(localRes.data.exp) || 0,
        guild: localRes.data.guild || 'None',
        region: localRes.data.server || region.toUpperCase(),
        credit_score: Number(localRes.data.credit_score) || 100,
        last_login_at: formatTimestamp(lastLoginStr),
        last_login_ms: parseDateToMs(lastLoginStr),
        account_created_at: formatTimestamp(localRes.data.created_at || localRes.data.createat)
      };
    }
  } catch (e) {
    // Continue to cloud API
  }

  // Option 2: Live suyashprofileapi.vercel.app
  try {
    const cloudRes = await axios.get('https://suyashprofileapi.vercel.app/profile?server=' + encodeURIComponent(region) + '&uid=' + encodeURIComponent(uid), {
      timeout: 7000
    });
    const d = cloudRes.data;
    if (d && d.basicinfo && d.basicinfo.nickname) {
      const lastLoginRaw = d.basicinfo.lastloginat;
      const creditScore = d.creditscoreinfo ? (Number(d.creditscoreinfo.creditscore) || 100) : 100;
      return {
        uid: String(uid),
        nickname: d.basicinfo.nickname,
        level: Number(d.basicinfo.level) || 1,
        likes: Number(d.basicinfo.liked) || 0,
        exp: Number(d.basicinfo.exp) || 0,
        guild: d.clanbasicinfo ? (d.clanbasicinfo.clanname || 'None') : 'None',
        region: d.basicinfo.region || region.toUpperCase(),
        credit_score: creditScore,
        last_login_at: formatTimestamp(lastLoginRaw),
        last_login_ms: parseDateToMs(lastLoginRaw),
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
    credit_score: 100,
    last_login_at: 'N/A',
    last_login_ms: null,
    account_created_at: 'N/A'
  };
}

module.exports = { fetchPlayerData, parseDateToMs, formatTimestamp };
