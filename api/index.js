const { fetchPlayerData } = require('../services/fetchPlayerData');
const { fetchBanStatus } = require('../services/fetchBanStatus');

module.exports = async function handler(req, res) {
	const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

	if (requestUrl.pathname === '/' || requestUrl.pathname === '/api') {
		return res.status(200).send('Node JS API for Garena Free Fire Ban Status by bhuwanhex (Aimguard)');
	}

	if (!requestUrl.pathname.endsWith('/check')) {
		return res.status(404).json({ error: 'Route not found' });
	}

	const uid = requestUrl.searchParams.get('uid');
	if (!uid) return res.status(400).json({ error: 'UID parameter is required' });

	try {
		const player = await fetchPlayerData(uid);
		if (!player.nickname) return res.status(404).json({ error: 'ID NOT FOUND' });

		const ban = await fetchBanStatus(uid);
		return res.status(200).json({ ...player, ...ban });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
