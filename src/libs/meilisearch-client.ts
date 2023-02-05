import config from '@/config';
import { MeiliSearch } from 'meilisearch';

const meilisearchCLient = new MeiliSearch({
	host: config.MEILI_HOST,
	apiKey: config.MEILI_API_KEY,
});

export default meilisearchCLient;
