import {
	readAVSCAsync,
	SchemaRegistry,
} from '@kafkajs/confluent-schema-registry';
import path from 'path';

const schemaRegistryClient = new SchemaRegistry({
	host: 'http://localhost:8081',
});

export async function registerSchema(schemaName: string) {
	const schemaPath = path.join('event-schema', `${schemaName}.avsc`);
	const schema = await readAVSCAsync(schemaPath);
	const { id } = await schemaRegistryClient.register(schema);
	return id;
}

export default schemaRegistryClient;
