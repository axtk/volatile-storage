import MemoryStorage from 'memory-storage';

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
    setMaxAge(maxAge) {
        this.maxAge = typeof maxAge === 'number' ? maxAge : Infinity;
        this.scheduleRevision();
    }
    hasValidContent(item) {
        return (
            Boolean(item) &&
            item.t + this.maxAge > Date.now() &&
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

        if (this.hasValidContent(item)) return item.x;
        else if (item) this.removeItem(key);
    }
    async setItem(key, value, options) {
        let item = {x: value, t: Date.now(), v: this.version};

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
            keys = [];

            let size = typeof storage.length === 'function' ?
                await storage.length() :
                storage.length;

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

export default VolatileStorage;
