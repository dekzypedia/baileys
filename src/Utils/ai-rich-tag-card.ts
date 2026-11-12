import { proto } from '../../WAProto/index.js'

export type AIRichTagCardOptions = {
	title?: string
	text: string
	footer?: string
	botName?: string
	botJid?: string
	creatorName?: string
	forwardingScore?: number
	modelName?: string
	/** Additional protobuf rich-response blocks (tables, code, images, maps, and other supported types). */
	submessages?: proto.IAIRichResponseSubMessage[]
}

/**
 * Builds a WhatsApp AI rich-response envelope using the current WAProto schema.
 * WhatsApp clients decide how and whether to render the rich response.
 */
export function buildAIRichTagCard(options: AIRichTagCardOptions): proto.IMessage {
	const title = options.title ?? 'Shinobu AI'
	const botName = options.botName ?? title
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

	if (options.submessages?.length) {
		submessages.push(...options.submessages)
	}

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
			modelNameOverride: options.modelName || 'Dekzyy AI'
		},
		messageDisclaimerText: options.footer || undefined,
		capabilityMetadata: {
			capabilities: [
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_HEADING,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_NESTED_LIST,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_TABLE,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_CODE,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_INLINE_IMAGE,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_GRID_IMAGE,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_LATEX,
				proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_MAPS
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
