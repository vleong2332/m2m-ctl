import { enqueue, defaultQueue } from '../reducers';

const newKey = 123;
const initKey = 456;
const newMessage = 'New queue';
const initMessage = 'Initial queue';
const emptyQueue = { queue: [] };

describe('enqueue', () => {

  it('is importable', () => {
    expect(enqueue).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof enqueue).toBe('function');
  });

  it('adds a queue entry to an empty list', () => {
    let prevState = emptyQueue;
    let newState = enqueue(newKey, newMessage)(prevState);
    expect(newState.queue).toEqual([
      { key: newKey, message: newMessage }
    ]);
  });

  it('works as intended with a non-empty queue', () => {
    let prevState = { queue: [
      { key: initKey, message: initMessage }
    ]};
    let newState = enqueue(newKey, newMessage)(prevState);
    expect(newState.queue).toEqual([
      { key: initKey, message: initMessage },
      { key: newKey, message: newMessage }
    ]);
  });

  // Invalid "state" args
  [
    undefined, null,
    true, false,
    {}, [],
    0, 1, -1,
    0.0, 1.1, -1.1,
    'abc', '', '   ',
  ]
  .forEach(stateVal => {
    it(`defaults state.queue to [] if state = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = enqueue(newKey, newMessage)(prevState);
      expect(newState.queue).toEqual([
        { key: newKey, message: newMessage }
      ]);
    });
  });

  // Invalid "queue" property
  [
    undefined, null,
    true, false,
    {},
    0, 1, -1,
    0.0, 1.1, -1.1,
    'abc', '', '   ',
  ]
  .forEach(queueVal => {
    it(`defaults queue to [] if state.queue is ${queueVal}`, () => {
      let prevState = { queue: queueVal }
      let newState = enqueue(newKey, newMessage)(prevState);
      expect(newState.queue).toEqual([
        { key: newKey, message: newMessage }
      ]);
    });
  });

  // Invalid "key" args
  [
    undefined, null,
    true, false,
    {}, [],
    '', '   ',
  ]
  .forEach(val => {
    it(`returns the same list if "key" arg is ${val}`, () => {
      let prevState1 = emptyQueue;
      let newState1 = enqueue(val, newMessage)(prevState1);
      expect(newState1.queue).toEqual(prevState1.queue);

      let prevState2 = { queue: [{ key: initKey, message: initMessage }]};
      let newState2 = enqueue(val, newMessage)(prevState2);
      expect(newState2.queue).toEqual(prevState2.queue);
    });
  });

  // Valid "key" args
  ['key', 0, 1, -1, 0.0, 1.1, -1.1]
  .forEach(val => {
    it(`works normally if "key" arg is ${val}`, () => {
      let prevState = emptyQueue;
      let newState = enqueue(val, newMessage)(prevState);
      expect(newState.queue).toEqual([
        { key: val, message: newMessage }
      ]);
    });
  });

  // Invalid "message" args
  [
    undefined, null,
    true, false,
    {}, [],
    0, 1, -1,
    0.0, 1.1, -1.1,
    '', '   ',
  ]
  .forEach(val => {
    it(`sets message to specified default if "message" arg is ${val}`, () => {
      let prevState = emptyQueue;
      let newState = enqueue(newKey, val)(prevState);
      expect(newState.queue).toEqual([
        { key: newKey, message: defaultQueue }
      ]);
    });
  });

  // Valid "message" args
  ['message', ' message ', 'a message', ' a message ']
  .forEach(val => {
    it(`accepts ${val} as "message" arg`, () => {
      let prevState = emptyQueue;
      let newState = enqueue(newKey, val)(prevState);
      expect(newState.queue).toEqual([
        { key: newKey, message: val }
      ]);
    });
  });

});
