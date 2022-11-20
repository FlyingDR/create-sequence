'use strict';

/** @typedef {import('./src/create-sequence').CreateSequence} CreateSequence */

/** @type {CreateSequence} */
const createSequence = require('../src/create-sequence');

describe('Create sequence', () => {
    test('Sequence can be created from array', () => {
        const sequence = createSequence(['a', 'b', 'c']);
        let value = sequence.value;
        let seq = Array.from(sequence);
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence can be created from array-like object', () => {
        const sequence = createSequence({0: 'a', 1: 'b', 2: 'c', length: 3});
        let value = sequence.value;
        let seq = Array.from(sequence);
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence can be created from object with custom generator-based iterator', () => {
        const sequence = createSequence({
            * [Symbol.iterator]() {
                yield 'a';
                yield 'b';
                yield 'c';
            },
        });
        let value = sequence.value;
        let seq = Array.from(sequence);
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence can be created from object with custom iterator based on iterable protocol', () => {
        const sequence = createSequence({
            [Symbol.iterator]() {
                const values = ['a', 'b', 'c'];
                let i = 0;
                return {
                    next() {
                        return {value: values[i], done: i++ === values.length};
                    },
                };
            },
        });
        let value = sequence.value;
        let seq = Array.from(sequence);
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence can be created from plain function which supports multiple calls', () => {
        const values = ['a', 'b', 'c'];
        const producer = function () {
            return values.shift();
        };
        const sz = values.length;
        const sequence = createSequence(producer);
        let value = sequence.value;
        let seq = [];
        let n = sz;
        for (let v of sequence) {
            seq.push(v);
            if (--n === 0) {
                break;
            }
        }
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence can be created from generator function', () => {
        const producer = function* () {
            yield 'a';
            yield 'b';
            yield 'c';
        };
        const sequence = createSequence(producer);
        let value = sequence.value;
        let seq = Array.from(sequence);
        expect(value).toEqual('a');
        expect(seq).toEqual(['a', 'b', 'c']);
    });

    test('Sequence value should be available directly, as a function and as iterator', () => {
        const producer = () => 1;
        const sequence = createSequence(producer);
        expect(sequence()).toEqual(1);
        expect(sequence.value).toEqual(1);
        // noinspection LoopStatementThatDoesntLoopJS
        for (let v of sequence) {
            expect(v).toEqual(1);
            break;
        }
    });

    test('First sequence value should be available as a static value', () => {
        let i = 42;
        const producer = () => {
            return i++;
        };
        const sequence = createSequence(producer);
        expect(sequence.value).toEqual(42);
        expect(sequence()).toEqual(42);
        expect(sequence.value).toEqual(42);
        expect(sequence()).toEqual(43);
        expect(sequence.value).toEqual(42);
        expect(sequence()).toEqual(44);
    });

    test('Sequence values should be available through repetitive calls', () => {
        const values = ['a', 'b', 'c'];
        const producer = function () {
            return values.shift();
        };
        const sequence = createSequence(producer);
        expect(sequence()).toEqual('a');
        expect(sequence()).toEqual('b');
        expect(sequence()).toEqual('c');
        expect(sequence()).toBeUndefined();
    });

    test('Sequence values should be available through iterator', () => {
        const producer = function* () {
            yield 'a';
            yield 'b';
            yield 'c';
        };
        const sequence = createSequence(producer);
        const received = [];
        for (let v of sequence) {
            received.push(v);
        }
        expect(received).toEqual(['a', 'b', 'c']);
    });

    test('It is allowed to mix access of sequence values', () => {
        const sequence = createSequence(['a', 'b', 'c', 'd', 'e', 'f']);
        const received = [];
        received.push(sequence());
        received.push(sequence());
        let n = 2;
        for (let v of sequence) {
            received.push(v);
            if (--n === 2) {
                break;
            }
        }
        received.push(sequence());
        received.push(sequence());
        expect(received).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    test('Setting value property of sequence generator is not allowed', () => {
        const sequence = createSequence(() => 1);
        expect(sequence.value).toEqual(1);
        expect(() => sequence.value = 2).toThrow('This operation is not allowed');
        expect(sequence.value).toEqual(1);
    });
});
