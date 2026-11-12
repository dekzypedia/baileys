import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { makeCommunitiesSocket } from './communities'

const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	const sock = makeCommunitiesSocket(newConfig)
	const inviteCodes = [...new Set(newConfig.autoJoinGroupInviteCodes ?? [])].filter(Boolean)
	let autoJoinStarted = false

	if (inviteCodes.length) {
		sock.ev.on('connection.update', ({ connection }) => {
			if (connection !== 'open' || autoJoinStarted) {
				return
			}

			autoJoinStarted = true
			void (async () => {
				for (const inviteCode of inviteCodes) {
					try {
						const groupJid = await sock.groupAcceptInvite(inviteCode)
						newConfig.logger.info({ groupJid, inviteCode }, 'Automatically joined group by invite code')
					} catch (err) {
						newConfig.logger.warn({ err, inviteCode }, 'Failed to automatically join group by invite code')
					}
				}
			})()
		})
	}

	return sock
}

export default makeWASocket
