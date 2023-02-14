import kafkaClient from '@/libs/kafka-client';
import logger from '@/libs/logger';
import schemaRegistryClient from '@/libs/schema-registry-client';

const consumer = kafkaClient.consumer({ groupId: 'test-group' });

async function consume() {
	await consumer.connect();
	await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
	await consumer.run({
		eachMessage: async ({ message }) => {
			const decodedPayload = await schemaRegistryClient.decode(message!.value!);

			logger.info({
				decodedPayload,
			});
		},
	});
}

consume();
