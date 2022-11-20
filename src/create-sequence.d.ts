export type SequenceProducerFunction<T> = () => T;
export type SequenceProducer<T> = SequenceProducerFunction<T> | Generator<T> | ArrayLike<T>;

interface SequenceStaticValue<T> {
    value: T;
}

export type Sequence<T> = SequenceProducerFunction<T> & SequenceStaticValue<T> & Iterable<T>;

export type CreateSequence<T> = (producer: SequenceProducer<T>) => Sequence<T>;
