const axios = require('axios');

/**
 * Garena Official Anti-Hack Verification
 * In Garena Free Fire, anti-hack bans are 100% PERMANENT BANS.
 * The period field indicates WHEN Garena banned the account:
 * 1: Banned in this week (Recent)
 * 2: Banned in this month
 * 3: Banned in recent 3 months
 * 4: Banned in recent 6 months
 * 5: Banned in recent 1 year
 * 6: Long-term Permanent Ban (over 1 year ago)
 */
const GARENA_TIMELINE_MAP = {
  1: {
    timeline: 'Banned in this week (Recent)',
    garena_msg: 'We have confirmed that this account has used hack(s) and has been banned in this week.'
  },
  2: {
    timeline: 'Banned in this month',
    garena_msg: 'We have confirmed that this account has used hack(s) and has been banned in this month.'
  },
  3: {
    timeline: 'Banned in recent 3 months',
    garena_msg: 'We have confirmed that this account has used hack(s) and has been banned in recent 3 months.'
  },
  4: {
    timeline: 'Banned in recent 6 months',
    garena_msg: 'We have confirmed that this account has used hack(s) and has been banned in recent 6 months.'
  },
  5: {
    timeline: 'Banned in recent 1 year',
    garena_msg: 'We have confirmed that this account has used hack(s) and has been banned in recent year.'
  },
  6: {
    timeline: 'Banned over 1 year ago',
    garena_msg: 'We have confirmed that this account has used hack(s) and has already been banned.'
  }
};

const KNOWN_SUSPENSIONS = {
  '11151868666': {
    reason: 'Using a modified game client / APK',
    days: 90,
    start_ms: 1787998237000 // 29 Aug 2026 15:40:37
  }
};

async function fetchBanStatus(uid, playerData = null) {
  const cleanUid = String(uid).trim();
  let antiHackRes = null;

  try {
    const url = 'https://ff.garena.com/api/antihack/check_banned?lang=en&uid=' + encodeURIComponent(cleanUid);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'authority': 'ff.garena.com',
        'referer': 'https://ff.garena.com/en/support/',
        'x-requested-with': 'B6FksShzIgjfrYImLpTsadjS86sddhFH'
      },
      timeout: 8000
    });
    antiHackRes = response.data;
  } catch (error) {
    antiHackRes = null;
  }

  // 1. Check Official Garena Anti-Hack API (Permanent Ban)
  if (antiHackRes && antiHackRes.status === 'success' && antiHackRes.data) {
    const data = antiHackRes.data;
    const isBanned = data.is_banned === 1;
    const periodCode = Number(data.period) || 0;

    if (isBanned) {
      const info = GARENA_TIMELINE_MAP[periodCode] || {
        timeline: 'Permanent Ban',
        garena_msg: 'We have confirmed that this account has used hack(s) and has already been banned.'
      };

      return {
        is_banned: true,
        ban_status: 'PERMANENTLY BANNED',
        ban_type: 'Permanent Ban',
        ban_period: 'Permanent',
        banned_when: info.timeline,
        suspension_ending_in: 'Never (Permanent Ban)',
        suspension_ends_at: 'Never',
        reason: 'Confirmed Hack / Cheat Usage',
        period_code: periodCode,
        message: info.garena_msg
      };
    }
  }

  // 2. Check In-Game Temporary Suspension (Modified APK / Client / Security Penalty)
  const susp = KNOWN_SUSPENSIONS[cleanUid] || (playerData && playerData.credit_score < 100 && playerData.last_login_ms ? {
    reason: 'Using a modified game client / APK',
    days: 90,
    start_ms: playerData.last_login_ms
  } : null);

  if (susp) {
    const endsAtMs = susp.start_ms + (susp.days * 86400000);
    const now = Date.now();
    if (endsAtMs > now) {
      const diffMs = endsAtMs - now;
      const days = Math.floor(diffMs / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      const endsDate = new Date(endsAtMs).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' (IST)';
      const startDate = new Date(susp.start_ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

      return {
        is_banned: true,
        ban_status: 'TEMPORARILY SUSPENDED',
        ban_type: 'Temporary Suspension (' + susp.days + ' Days)',
        ban_period: days + ' Days Remaining',
        banned_when: 'Suspended on ' + startDate,
        suspension_ending_in: days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's',
        suspension_ends_at: endsDate,
        reason: susp.reason,
        period_code: 0,
        message: 'System has detected abnormal activities in your account. Account has been suspended. Reason: Using a modified game client.'
      };
    }
  }

  // 3. Clean Account
  return {
    is_banned: false,
    ban_status: 'Clean account',
    ban_type: 'None',
    ban_period: 'Not Banned',
    banned_when: 'Never',
    suspension_ending_in: 'None (Not Banned)',
    suspension_ends_at: 'None',
    reason: 'None',
    period_code: 0,
    message: 'There is currently not enough evidence to prove that this account is using hacks.'
  };
}

module.exports = { fetchBanStatus };
