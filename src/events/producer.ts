import kafkaClient from '@/libs/kafka-client';
import schemaRegistryClient, {
	registerSchema,
} from '@/libs/schema-registry-client';

const producer = kafkaClient.producer();

async function publish() {
	await producer.connect();
	const payload = { gender: 'm', name: 'Pablo', age: 10 };
	const schemaId = await registerSchema('user-schema');
	const encodedPayload = await schemaRegistryClient.encode(schemaId, payload);
	await producer.send({
		topic: 'test-topic',
		messages: [{ value: encodedPayload }],
	});

	await producer.disconnect();
}

publish();
