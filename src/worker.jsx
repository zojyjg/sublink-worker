import { createApp } from './app/createApp.jsx';
import { createCloudflareRuntime } from './runtime/cloudflare.js';

let honoApp;
let runtimeSignature;

function getApp(env) {
    // Secrets can be rotated without a code change. Rebuild the app when the
    // relevant bindings change so a warm isolate does not keep old tokens.
    const nextSignature = `${env?.GENERATED_SUBSCRIPTION_SYNC_TOKEN || ''}:${env?.GENERATED_SUBSCRIPTION_DOWNLOAD_TOKEN || ''}`;
    if (!honoApp || runtimeSignature !== nextSignature) {
        const runtime = createCloudflareRuntime(env);
        honoApp = createApp(runtime);
        runtimeSignature = nextSignature;
    }
    return honoApp;
}

export default {
    fetch(request, env, ctx) {
        const app = getApp(env);
        return app.fetch(request, env, ctx);
    }
};
