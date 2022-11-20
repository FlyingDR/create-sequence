'use strict';

/**
 * Create sequence from given producer
 *
 * Producer may be one of:
 *  - Array-like value
 *  - Generator
 *  - Generator function
 *  - Plain function that allows multiple calls and produces sequence of values
 *
 * Sequence can be accessed as:
 *  - "value" property to statically access first value of the sequence
 *  - built-in iterator
 *  - repetitive calls of the sequence function to get next value of the sequence
 *
 * @type {CreateSequence}
 */
function createSequence(producer) {
    let firstValue;
    let firstValueTaken = false;
    let firstValueSent = false;

    const generator = (function* () {
        let producerIterator;
        if (typeof producer[Symbol.iterator] !== 'undefined') {
            // Direct iterator
            producerIterator = producer;
        } else if (typeof producer.prototype === 'object' && typeof producer.prototype[Symbol.iterator] === 'function') {
            // Generator function
            producerIterator = producer();
        } else if (typeof producer === 'object' && typeof producer.length === 'number') {
            // Array-like object
            producerIterator = Array.from(producer);
        }
        if (Array.isArray(producer)) {
            for (let v of producer) {
                yield v;
            }
        } else if (producerIterator) {
            for (let v of producerIterator) {
                yield v;
            }
        } else if (typeof producer === 'function') {
            do {
                let v = producer();
                yield v;
            } while (true);
        }
    })();

    const getFirstValue = () => {
        if (!firstValueTaken) {
            firstValue = generator.next().value;
            firstValueTaken = true;
        }
        return firstValue;
    };

    const nextValue = function* () {
        if (!firstValueTaken) {
            // First value from generator is not yet taken, so we have to take it
            let value = getFirstValue();
            firstValueSent = true;
            yield value;
        }
        if (!firstValueSent) {
            // First value from generator was already taken, but not yet sent, so we have to return it
            firstValueSent = true;
            yield firstValue;
        }
        // First value from generator was already sent, work as usual
        for (let value of generator) {
            yield value;
        }
    };

    const exposedKeys = ['value', Symbol.iterator];
    const notAllowed = () => {
        throw new Error('This operation is not allowed');
    };
    return new Proxy(Function.prototype, {
        apply: () => nextValue().next().value,
        get(target, p, receiver) {
            switch (p) {
                case 'value':
                    return getFirstValue();
                case Symbol.iterator:
                    return function* () {
                        for (let v of nextValue()) {
                            yield v;
                        }
                    };
                default:
                    return Reflect.get(target, p, receiver);
            }
        },
        getOwnPropertyDescriptor(target, p) {
            switch (p) {
                case 'value':
                    return {
                        value: getFirstValue(),
                        writable: false,
                        get: getFirstValue,
                        set: undefined,
                        configurable: false,
                        enumerable: false,
                    };
                case Symbol.iterator:
                    return {
                        value: nextValue,
                        writable: false,
                        get: undefined,
                        set: undefined,
                        configurable: false,
                        enumerable: false,
                    };
                default:
                    return Reflect.getOwnPropertyDescriptor(target, p);
            }
        },
        getPrototypeOf: () => Function.prototype,
        has: (target, p) => Reflect.ownKeys(target).includes(p) || exposedKeys.includes(p),
        isExtensible: () => false,
        ownKeys: target => [...Reflect.ownKeys(target), ...exposedKeys],
        set: notAllowed,
        setPrototypeOf: notAllowed,
    });
}

module.exports = createSequence;
