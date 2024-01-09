import config from '@/config';
import { Client } from '@opensearch-project/opensearch';

const opensearchClient = new Client({
	node: config.OPENSEARCH_URI,
	memoryCircuitBreaker: {
		enabled: true,
		maxPercentage: 0.8,
	},
});

export default opensearchClient;
