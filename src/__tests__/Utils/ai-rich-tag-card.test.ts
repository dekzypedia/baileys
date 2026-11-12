import { proto } from '../../../WAProto/index.js'
import { buildAIRichTagCard, buildAIRichTagCardMessage } from '../../Utils/ai-rich-tag-card'

describe('AI rich tag cards', () => {
	it('includes bot forwarding context and default text blocks', () => {
		const message = buildAIRichTagCard({
			title: 'Dekzyy',
			text: 'Hello from the rich response',
			footer: 'Powered by Dekzyy',
			creatorName: 'Dekzyy'
		})

		expect(message.messageContextInfo?.forwardedAiBotMessageInfo).toMatchObject({
			botName: 'Dekzyy',
			creatorName: 'Dekzyy'
		})
		expect(message.messageContextInfo?.botMetadata?.modelMetadata?.modelNameOverride).toBe('Dekzyy AI')
		expect(message.botForwardedMessage?.message?.richResponseMessage?.submessages).toEqual([
			{ messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT, messageText: '*Dekzyy*' },
			{ messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT, messageText: 'Hello from the rich response' },
			{ messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT, messageText: 'Powered by Dekzyy' }
		])
	})

	it('preserves caller-supplied rich protobuf blocks', () => {
		const table: proto.IAIRichResponseSubMessage = {
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TABLE,
			tableMetadata: {
				title: 'Status',
				rows: [{ items: ['Feature', 'Available'], isHeading: true }]
			}
		}
		const code: proto.IAIRichResponseSubMessage = {
			messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_CODE,
			codeMetadata: { codeLanguage: 'ts', codeBlocks: [{ codeContent: 'const ok = true' }] }
		}

		const message = buildAIRichTagCardMessage({ text: 'Details', submessages: [table, code] })
		const blocks = message.botForwardedMessage?.message?.richResponseMessage?.submessages

		expect(blocks).toEqual(expect.arrayContaining([table, code]))
	})
})
