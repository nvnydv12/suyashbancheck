const { fetchPlayerData } = require('../services/fetchPlayerData');
const { fetchBanStatus } = require('../services/fetchBanStatus');

async function getBanInfo(req, res) {
  const uid = req.query.uid;
  const region = req.query.region || req.query.server || 'IND';

  if (!uid || !/^\d+$/.test(String(uid).trim())) {
    return res.status(400).json({
      success: false,
      error: 'Valid numeric UID parameter is required. Example: /check?uid=1171436371'
    });
  }

  const cleanUid = String(uid).trim();

  try {
    // 1. Fetch Real Player Details (Exact Level, Likes, Nickname, Guild, Dates, Credit Score)
    const player = await fetchPlayerData(cleanUid, region);

    // 2. Fetch real ban & suspension status
    const ban = await fetchBanStatus(cleanUid, player);

    res.json({
      success: true,
      uid: cleanUid,
      nickname: player.nickname,
      level: player.level,
      likes: player.likes,
      exp: player.exp,
      guild: player.guild,
      region: player.region,
      is_banned: ban.is_banned,
      ban_status: ban.ban_status,
      ban_type: ban.ban_type,
      ban_period: ban.ban_period,
      banned_when: ban.banned_when,
      suspension_ending_in: ban.suspension_ending_in,
      suspension_ends_at: ban.suspension_ends_at,
      reason: ban.reason,
      credit_score: player.credit_score,
      last_active_at: player.last_login_at,
      account_created_at: player.account_created_at,
      message: ban.message,
      developer: 'Bunnysh17'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = { getBanInfo };
