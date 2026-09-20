import { proto } from '../../WAProto/index.js'

export type AIRichTagCardOptions = {
	title?: string
	text: string
	footer?: string
	botName?: string
	botJid?: string
	creatorName?: string
	forwardingScore?: number
	quoted?: proto.IWebMessageInfo
	modelName?: string
}

/**
 * Builds the WhatsApp AI rich-response envelope used by the current WAProto.
 * The client decides how/if this envelope is rendered; this helper does not
 * pretend to force a particular WhatsApp UI.
 */
export function buildAIRichTagCard(options: AIRichTagCardOptions): proto.IMessage {
	const title = options.title || 'Shinobu AI'
	const botName = options.botName || title
	const forwardingScore = options.forwardingScore ?? 1
	const submessages: proto.IAIRichResponseSubMessage[] = []

	if (title) {
		submessages.push({
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
			messageText: `*${title}*`
		})
	}
	submessages.push({
		messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
		messageText: options.text
	})
	if (options.footer) {
		submessages.push({
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
			messageText: options.footer
		})
	}

	const richResponse: proto.IAIRichResponseMessage = {
		messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
		submessages,
		contextInfo: {
			forwardingScore,
			isForwarded: true
		}
	}

	const forwardedContext: proto.IMessageContextInfo = {
		forwardingScore,
		isForwarded: true,
		forwardedAiBotMessageInfo: {
			botName,
			botJid: options.botJid,
			creatorName: options.creatorName
		},
		botMessageSharingInfo: {
			forwardScore: forwardingScore
		}
	}

	const botMetadata: proto.IBotMetadata = {
		modelMetadata: {
			modelNameOverride: options.modelName || 'Dekzypedia AI'
		},
		messageDisclaimerText: options.footer || undefined,
		capabilityMetadata: {
			capabilities: [
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_HEADING,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_NESTED_LIST,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_TABLE
			]
		}
	}

	return {
		messageContextInfo: {
			...forwardedContext,
			botMetadata
		},
		botForwardedMessage: {
			message: {
				richResponseMessage: richResponse
			}
		}
	}
}

export function buildAIRichTagCardMessage(options: AIRichTagCardOptions): proto.Message {
	return proto.Message.create(buildAIRichTagCard(options))
}
