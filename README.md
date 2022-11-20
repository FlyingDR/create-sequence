# create-sequence

Simple module to allow creating unified interface for accessing sequence of values from different kinds of producers.

## Usage

Usage is trivial, you only need to provide [`producer`](#producer) function to obtain a [sequence](#sequence) for it: 

```js
const sequence = createSequence(producer);
```

### Producer

Producer can any of these types:

 - [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) 
 - [`Array`-like](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods) value 
 - Object that implements [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)  
 - [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) or [Generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
 - Plain function that allows multiple calls and returns next sequence value for each call

Please refer to [tests](tests/create-sequence.test.js) for examples of different kinds of supported producers. 

### Sequence 

Returned sequence allows access to the sequence values in multiple ways:

1. `value` property is exposed to allow static access to the first value of the sequence
   ```js
   const sequence = createSequence(['a', 'b', 'c']);
   console.log(sequence.value); // a 
   ``` 
2. Sequence itself implements [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)
   ```js
   const sequence = createSequence(['a', 'b', 'c']);
   for (let v of sequence) {
       console.log(v); // prints a, b and c  
   }
   ``` 
3. Sequence itself is a function that returns next sequence value on each subsequent call
   ```js
   const sequence = createSequence(['a', 'b', 'c']);
   console.log(sequence()); // a 
   console.log(sequence()); // b 
   console.log(sequence()); // c 
   ``` 
