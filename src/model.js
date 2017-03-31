import { mix } from './helpers/mixin.js';
import SchemaModel from '@chialab/schema-model';
import { internal } from './helpers/internal.js';

import { CallbackMixin } from './mixins/callback.js';
import { BaseMixin } from './mixins/base.js';

export class Model extends mix(SchemaModel).with(CallbackMixin, BaseMixin) {
    static get schema() {
        return undefined;
    }

    static get properties() {
        return [];
    }

    // eslint-disable-next-line
    constructor() {
        super();
    }

    initialize(data) {
        return super.initialize()
            .then(() => {
                this.set(data);
                return Promise.resolve();
            });
    }

    set(data, value, options = false) {
        if (typeof options === 'boolean') {
            options = {
                skipChanges: options,
            };
        }
        if (typeof data === 'object') {
            options = value || {};
            let changed = false;
            if (!options.skipChanges && !options.internal) {
                for (let k in data) {
                    if (this[k] !== data[k]) {
                        changed = true;
                        this.setChanges(k, this[k], data[k]);
                    }
                }
            }
            super.set(data, options);
            if (changed) {
                this.trigger('change');
            }
        } else if (typeof data === 'string') {
            let s = {};
            s[data] = value;
            this.set(s, options);
        }
    }

    resetChanges() {
        internal(this).changes = {};
    }

    setChanges(key, oldValue, newValue) {
        internal(this).changes = internal(this).changes || {};
        internal(this).changes[key] = {
            oldValue,
            newValue,
        };
    }

    getChanges() {
        return internal(this).changes || {};
    }

    changed() {
        return Object.keys(this.getChanges());
    }

    hasChanges() {
        return !!this.changed().length;
    }

    validate(...args) {
        if (this.constructor.schema) {
            return super.validate(...args);
        } else {
            return { valid: true };
        }
    }

    toJSON(stripUndefined) {
        let Ctr = this.constructor;
        if (Ctr.schema) {
            return super.toJSON(stripUndefined);
        }
        let res = {};
        (Ctr.properties || []).forEach((key) => {
            let val = this.get(key);
            if (!stripUndefined || val !== undefined) {
                res[key] = val;
            }
        });
        return res;
    }

    factory(name) {
        let injected = this.getContext().getInjected();
        return injected && injected[name];
    }

    reset() {
        const Ctr = this.constructor;
        let props = {};
        if (Ctr.schema) {
            props = Object.keys(Ctr.schemaProperties);
        } else if (Ctr.properties) {
            props = Ctr.properties;
        }
        let set = {};
        props.forEach((prop) => {
            if (prop !== 'id' && prop !== 'type') {
                set[prop] = undefined;
            }
        });
        this.set(set, { validate: false });
    }

    destroy() {
        this.set('deleted', true, { internal: true });
        this.reset();
        this.trigger('change', true);
        return super.destroy();
    }
}

Model.ready = Promise.resolve();
