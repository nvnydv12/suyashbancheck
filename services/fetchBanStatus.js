const axios = require('axios');

/**
 * Garena Official Anti-Hack Verification
 * In Garena Free Fire, anti-hack bans are 100% PERMANENT BANS.
 * The `period` field indicates WHEN Garena banned the account:
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

async function fetchBanStatus(uid) {
  const url = `https://ff.garena.com/api/antihack/check_banned?lang=en&uid=${encodeURIComponent(uid)}`;

  try {
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

    const resData = response.data;
    if (resData && resData.status === 'success' && resData.data) {
      const data = resData.data;
      const isBanned = data.is_banned === 1;
      const periodCode = Number(data.period) || 0;

      if (!isBanned) {
        return {
          is_banned: false,
          ban_status: 'Clean account',
          ban_type: 'None',
          ban_period: 'Not Banned',
          banned_when: 'Never',
          period_code: 0,
          message: 'There is currently not enough evidence to prove that this account is using hacks.'
        };
      }

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
        period_code: periodCode,
        message: info.garena_msg
      };
    } else if (resData && resData.status === 'error') {
      return {
        is_banned: false,
        ban_status: 'ID NOT FOUND',
        ban_type: 'None',
        ban_period: null,
        banned_when: 'N/A',
        period_code: 0,
        message: 'No matched account found on Garena Free Fire servers.',
        error: resData.msg || 'Invalid request'
      };
    }

    return {
      is_banned: false,
      ban_status: 'Clean account',
      ban_type: 'None',
      ban_period: 'Not Banned',
      banned_when: 'Never',
      period_code: 0,
      message: 'There is currently not enough evidence to prove that this account is using hacks.'
    };
  } catch (error) {
    return {
      is_banned: false,
      ban_status: 'Unknown',
      ban_type: 'Unknown',
      ban_period: null,
      banned_when: 'Unknown',
      period_code: 0,
      message: 'Network error checking Garena Anti-Hack API: ' + error.message,
      error: error.message
    };
  }
}

module.exports = { fetchBanStatus };
