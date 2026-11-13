import { proto } from '../../WAProto/index.js'

export type AIRichTagCardOptions = {
	/** heading rendered above the response body; falls back to botName */
	title?: string
	text: string
	footer?: string
	/** bot name used when title is omitted */
	botName?: string
	/** bot jid reported as the invoker of the rich response */
	botJid?: string
	forwardingScore?: number
	modelName?: string
}

/**
 * Builds the WhatsApp AI rich-response envelope used by the current WAProto.
 * The client decides how/if this envelope is rendered; this helper does not
 * pretend to force a particular WhatsApp UI.
 */
export function buildAIRichTagCard(options: AIRichTagCardOptions): proto.IMessage {
	const title = options.title || options.botName || 'Shinobu AI'
	const forwardingScore = options.forwardingScore ?? 1
	const submessages: proto.IAIRichResponseSubMessage[] = [
		{
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
			messageText: `*${title}*`
		},
		{
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
			messageText: options.text
		}
	]
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
			isForwarded: true,
			forwardingScore
		}
	}

	const botMetadata: proto.IBotMetadata = {
		modelMetadata: {
			modelNameOverride: options.modelName || 'Dekzypedia AI'
		},
		messageDisclaimerText: options.footer || undefined,
		invokerJid: options.botJid,
		capabilityMetadata: {
			capabilities: [
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_HEADING,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_NESTED_LIST,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_TABLE
			]
		}
	}

	return {
		messageContextInfo: { botMetadata },
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
