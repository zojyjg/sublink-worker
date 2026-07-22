// Provider-neutral OpenClash policy. Keep this file free of subscription URLs
// and node credentials: it is safe to publish with the worker fork.

const regions = [
    ['🇯🇵 日本', '🇯🇵|日本|(?i)JP|Japan'],
    ['🇭🇰 香港', '🇭🇰|香港|(?i)HK|Hong Kong'],
    ['🇰🇷 韩国', '🇰🇷|韩国|(?i)KR|Korea'],
    ['🇺🇸 美国', '🇺🇸|美国|(?i)US|United States'],
    ['🇬🇧 英国', '🇬🇧|英国|(?i)GB|United Kingdom|UK'],
    ['🇹🇼 台湾', '🇹🇼|台湾|(?i)TW|Taiwan'],
    ['🇸🇬 新加坡', '🇸🇬|新加坡|(?i)SG|Singapore']
];

const regionalNodes = regions.map(([name]) => `${name}节点`);
const serviceGroups = [
    '🤖 AI', '🍎 Apple', '🖥 Microsoft', '💳 Paypal', '📽️ Bilibili',
    '👙 TikTok', '🎮 Steam', '🔍 Google', '🎵 Spotify', '📢 Facebook', '📢 Discord',
    '📢 Telegram', '📢 Whatsapp', '📢 Line', '📢 Linkedin', '📢 Reddit',
    '♥ Instagram', '♥ Twitter', '📽️ Netflix', '📽️ Disney', '📽️ PrimeVideo',
    '📽 Twitch', '📽️ HBO', '📽 Abema', '📽️ Bahamut', '📽 BBC', '📽 DAZN'
];

const aliases = new Map([
    ['MESL', '🔀 节点'], ['Proxies', '🔀 节点'], ['Proxy', '🔀 节点'],
    ['OpenAI', '🤖 AI'], ['AI', '🤖 AI'], ['Apple', '🍎 Apple'],
    ['PayPal', '💳 Paypal'], ['Paypal', '💳 Paypal'], ['Google', '🔍 Google'],
    ['Microsoft', '🖥 Microsoft'], ['YouTube', '🔍 Google'], ['Spotify', '🎵 Spotify'],
    ['Telegram', '📢 Telegram'], ['Netflix', '📽️ Netflix'], ['Disney', '📽️ Disney'],
    ['Hbomax', '📽️ HBO'], ['HBO', '📽️ HBO'], ['Bahamut', '📽️ Bahamut'],
    ['Bilibili', '📽️ Bilibili'], ['Steam', '🎮 Steam'], ['TikTok', '👙 TikTok'],
    ['HK', '🇭🇰 香港节点'], ['JP', '🇯🇵 日本节点'], ['SG', '🇸🇬 新加坡节点'],
    ['TW', '🇹🇼 台湾节点'], ['US', '🇺🇸 美国节点']
]);

const financeDomains = `
chase.com bankofamerica.com wellsfargo.com citi.com usbank.com pnc.com truist.com
capitalone.com ally.com sofi.com marcus.com goldmansachs.com usaa.com navyfederal.org discover.com
americanexpress.com visa.com mastercard.com synchrony.com synchronybank.com breadfinancial.com
comenity.net barclaycardus.com barclaysus.com bilt.com fidelity.com schwab.com tdameritrade.com
vanguard.com etrade.com robinhood.com interactivebrokers.com ibkr.com webull.com tastytrade.com
tradestation.com firstrade.com moomoo.com public.com revolut.com revolut.us irs.gov eftps.gov
turbotax.com hrblock.com taxact.com id.me equifax.com experian.com transunion.com
annualcreditreport.com creditkarma.com myfico.com innovis.com chexsystems.com earlywarning.com
lexisnexis.com plaid.com zellepay.com venmo.com cash.app squareup.com chime.com varomoney.com
current.com albert.com affirm.com klarna.com afterpay.com healthequity.com optumbank.com att.com
verizon.com t-mobile.com uscellular.com visible.com cricketwireless.com metrobyt-mobile.com
mintmobile.com usmobile.com googlefi.com boostmobile.com totalwireless.com tracfone.com
straighttalk.com simplemobile.com ting.com redpocket.com consumercellular.com xfinity.com spectrum.com
walmart.com samsclub.com bestbuy.com amazon.com amazonpay.com target.com costco.com homedepot.com
lowes.com ebay.com newegg.com`.trim().split(/\s+/);

const fixedRules = [
    'DOMAIN-KEYWORD,mcc234,UK-VoWiFi',
    'DOMAIN-SUFFIX,entsrv-uk.vodafone.com,UK-VoWiFi',
    'DOMAIN-SUFFIX,vuk-gto.prod.ondemandconnectivity.com,UK-VoWiFi',
    'DOMAIN,vfgb.idemia.io,UK-VoWiFi',
    'DOMAIN-SUFFIX,ct.ee.co.uk,UK-VoWiFi',
    'DOMAIN-SUFFIX,pub.3gppnetwork.org,UK-VoWiFi',
    'IP-CIDR,31.94.0.0/16,UK-VoWiFi,no-resolve',
    'IP-CIDR,46.68.0.0/17,UK-VoWiFi,no-resolve',
    'IP-CIDR,88.82.0.0/19,UK-VoWiFi,no-resolve',
    'IP-CIDR,148.252.160.0/19,UK-VoWiFi,no-resolve',
    'IP-CIDR,87.194.0.0/16,UK-VoWiFi,no-resolve',
    'RULE-SET,google-ai,Google AI',
    'RULE-SET,crypto,💱 Crypto',
    ...financeDomains.map(domain => `DOMAIN-SUFFIX,${domain},🇺🇸 美国金融`)
];

function selector(name, preferred, providerNames = []) {
    // DIRECT must remain a selectable exit for services that should bypass the proxy.
    const options = [...regionalNodes, '🔀 节点', 'Fallback', 'Auto', 'DIRECT'];
    return {
        name,
        type: 'select',
        proxies: preferred ? [preferred, ...options.filter(item => item !== preferred)] : options,
        'include-all': true,
        ...(providerNames.length > 0 ? { use: providerNames } : {})
    };
}

function remapRule(rule) {
    if (typeof rule !== 'string') return null;
    const fields = rule.split(',');
    if (fields[0] === 'MATCH') return null;
    if (fields.length >= 3) {
        const target = fields.at(-1) === 'no-resolve' || fields.at(-1) === 'src' ? -2 : -1;
        fields[fields.length + target] = aliases.get(fields.at(target)) || fields.at(target);
    }
    return fields.join(',');
}

export function buildUnifiedOpenClashPolicy(config, sourceRules = [], sourceRuleProviders = {}, sourceProxyProviders = {}) {
    const providerNames = Object.keys(sourceProxyProviders);
    const groups = [];
    for (const [name, filter] of regions) {
        groups.push({ name: `${name}节点`, type: 'select', proxies: [`${name}自动`], 'include-all': true, filter, ...(providerNames.length > 0 ? { use: providerNames } : {}) });
    }
    groups.push(
        { name: '🔀 节点', type: 'select', proxies: [...regionalNodes, 'Fallback', 'Auto', 'DIRECT'], 'include-all': true, ...(providerNames.length > 0 ? { use: providerNames } : {}) },
        { name: 'Fallback', type: 'fallback', 'include-all': true, url: 'https://www.gstatic.com/generate_204', interval: 300, ...(providerNames.length > 0 ? { use: providerNames } : {}) },
        { name: 'Auto', type: 'url-test', 'include-all': true, url: 'https://www.gstatic.com/generate_204', interval: 300, tolerance: 100, ...(providerNames.length > 0 ? { use: providerNames } : {}) }
    );
    for (const name of serviceGroups) groups.push(selector(name, undefined, providerNames));
    const googleIndex = groups.findIndex(group => group.name === '🔍 Google');
    groups.splice(googleIndex + 1, 0, selector('Google AI', undefined, providerNames));
    groups.push(selector('💱 Crypto', '🇯🇵 日本节点', providerNames));
    groups.push(selector('🇺🇸 美国金融', '🇺🇸 美国节点', providerNames));
    groups.push(selector('UK-VoWiFi', '🇬🇧 英国节点', providerNames));
    groups.push(selector('Final', undefined, providerNames));
    for (const [name, filter] of regions) {
        groups.push({
            name: `${name}自动`, type: 'url-test', 'include-all': true, filter,
            url: 'https://www.gstatic.com/generate_204', interval: 300, tolerance: 100, 'disable-udp': false,
            ...(providerNames.length > 0 ? { use: providerNames } : {})
        });
    }

    if (providerNames.length > 0) config['proxy-providers'] = sourceProxyProviders;
    config['proxy-groups'] = groups;
    config['rule-providers'] = {
        ...sourceRuleProviders,
        'google-ai': {
            type: 'http', behavior: 'domain', format: 'yaml', path: './rule_provider/google-ai.yaml',
            url: 'https://raw.githubusercontent.com/VPSDance/ai-proxy-rules/main/rules/clash/google-ai.yaml', interval: 86400
        },
        crypto: {
            type: 'http', behavior: 'classical', format: 'yaml', path: './rule_provider/crypto.yaml',
            url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/Ruleset/Crypto.yaml', interval: 86400
        }
    };
    const source = sourceRules.map(remapRule).filter(Boolean).filter(rule => !fixedRules.includes(rule));
    config.rules = [...fixedRules, ...source, 'MATCH,Final'];
    delete config['x-openclash-unified'];
    return config;
}
