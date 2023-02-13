import { Kafka } from 'kafkajs';

const kafkaClient = new Kafka({
	clientId: 'my-app',
	brokers: ['localhost:9093'],
});

export default kafkaClient;
