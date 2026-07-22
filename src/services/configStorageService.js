import yaml from 'js-yaml';
import { generateWebPath } from '../utils.js';
import { InvalidPayloadError, MissingDependencyError } from './errors.js';

export class ConfigStorageService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
    }

    ensureKv() {
        if (!this.kv) {
            throw new MissingDependencyError('Config storage requires a KV store');
        }
        return this.kv;
    }

    async getConfigById(configId) {
        const kv = this.ensureKv();
        const stored = await kv.get(configId);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            throw new InvalidPayloadError('Stored config is not valid JSON');
        }
    }

    async saveConfig(type, content) {
        if (!type) {
            throw new InvalidPayloadError('Missing config type');
        }

        const kv = this.ensureKv();
        const configId = `${type}_${generateWebPath(8)}`;
        const configString = this.serializeConfig(type, content);

        // Validate string is JSON before storing
        JSON.parse(configString);

        const ttlSeconds = this.options.configTtlSeconds;
        const putOptions = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined;
        await kv.put(configId, configString, putOptions);
        return configId;
    }

    async saveSource(content) {
        if (typeof content !== 'string' || content.trim() === '') {
            throw new InvalidPayloadError('Source content is required');
        }
        const kv = this.ensureKv();
        const sourceId = `source_${generateWebPath(8)}`;
        const record = JSON.stringify({ content });
        const ttlSeconds = this.options.configTtlSeconds;
        const putOptions = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined;
        await kv.put(sourceId, record, putOptions);
        return sourceId;
    }

    async getSourceById(sourceId) {
        const stored = await this.ensureKv().get(sourceId);
        if (!stored) return null;
        try {
            const record = JSON.parse(stored);
            return typeof record?.content === 'string' ? record.content : null;
        } catch {
            throw new InvalidPayloadError('Stored source is not valid JSON');
        }
    }

    serializeConfig(type, content) {
        if (type === 'clash') {
            if (typeof content === 'string' && (content.trim().startsWith('-') || content.includes(':'))) {
                const yamlConfig = yaml.load(content);
                return JSON.stringify(yamlConfig);
            }
            return typeof content === 'object' ? JSON.stringify(content) : content;
        }

        if (typeof content === 'object') {
            return JSON.stringify(content);
        }
        if (typeof content === 'string') {
            return content;
        }
        throw new InvalidPayloadError('Unsupported config content type');
    }
}
