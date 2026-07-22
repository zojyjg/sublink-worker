import { CloudflareKVAdapter } from '../adapters/kv/cloudflareKv.js';

export function createCloudflareRuntime(env) {
    return {
        kv: env?.SUBLINK_KV ? new CloudflareKVAdapter(env.SUBLINK_KV) : null,
        assetFetcher: env?.ASSETS ? (request) => env.ASSETS.fetch(request) : null,
        logger: console,
        config: {
            generatedSubscriptionSyncToken: env?.GENERATED_SUBSCRIPTION_SYNC_TOKEN,
            generatedSubscriptionDownloadToken: env?.GENERATED_SUBSCRIPTION_DOWNLOAD_TOKEN
        }
    };
}
