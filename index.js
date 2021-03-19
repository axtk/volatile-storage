const MemoryStorage = require('@axtk/memory-storage');

class VolatileStorage {
    constructor(props = {}) {
        this.storage = props.storage || new MemoryStorage();
        this.ns = props.ns ? props.ns + '.' : '';
        this.version = props.version;

        this.setCapacity(props.capacity);
        this.setMaxAge(props.maxAge);
        this.scheduleRevision();
    }
    setCapacity(capacity) {
        this.capacity = typeof capacity === 'number' ? capacity : Infinity;
        this.scheduleRevision();
    }
    getCapacity() {
        return this.capacity;
    }
    setMaxAge(maxAge) {
        this.maxAge = typeof maxAge === 'number' ? maxAge : Infinity;
        this.scheduleRevision();
    }
    getMaxAge() {
        return this.maxAge;
    }
    hasValidContent(item) {
        return (
            Boolean(item) &&
            item.t + (item.d === undefined ? this.maxAge : item.d) > Date.now() &&
            item.v === this.version
        );
    }
    async getItem(key) {
        let t = Date.now(), item;

        try {
            let storedValue = await this.storage.getItem(this.ns + key);
            item = JSON.parse(storedValue);
        }
        catch(e) {}

        // Infinity is stringified as null
        if (item && item.d === null)
            item.d = Infinity;

        if (this.hasValidContent(item)) return item.x;
        else if (item) this.removeItem(key);
    }
    async setItem(key, value, options = {}) {
        let item = {x: value, t: Date.now(), d: options.maxAge, v: this.version};

        await this.storage.setItem(this.ns + key, JSON.stringify(item));
        this.scheduleRevision();
    }
    async removeItem(key) {
        await this.storage.removeItem(this.ns + key);
    }
    async key(index) {
        return await this.storage.key(index);
    }
    async clear() {
        await this.storage.clear();
    }
    async keys() {
        let {storage, ns} = this, keys;

        if (typeof storage.keys === 'function')
            keys = await storage.keys();
        else {
            let size = await this.length();
            keys = [];

            for (let i = 0; i < size; i++)
                keys.push(await storage.key(i));
        }

        if (ns) {
            keys = keys
                .filter(key => key && key.startsWith(ns))
                .map(key => key.slice(ns.length));
        }

        return keys;
    }
    async length() {
        let {storage} = this;

        return typeof storage.length === 'function' ?
            await storage.length() :
            storage.length;
    }
    async revise() {
        let keys = await this.keys();
        let overflow = keys.length - this.capacity;

        return Promise.all(
            keys.map(async (key, i) => {
                if (i < overflow) await this.removeItem(key);
                // getItem() on expired items will remove them
                else await this.getItem(key);
            })
        );
    }
    scheduleRevision() {
        clearTimeout(this._revisionTimeout);
        this._revisionTimeout = setTimeout(() => this.revise(), 50);
    }
}

module.exports = VolatileStorage;
