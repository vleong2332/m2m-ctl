import { dequeue } from '../reducers';

const item1Key = 123;
const item2Key = 456;
const item3Key = 789;
const notInListKey = 999;
const item1Msg = 'Doing something';
const item2Msg = 'Doing nothing';
const item3Msg = 'Doing everything';

const emptyQueue = { queue: [] };
const oneInQueue = { queue: [
  { key: item1Key, message: item1Msg }
]};
const twoInQueue = { queue: [
  { key: item1Key, message: item1Msg },
  { key: item2Key, message: item2Msg }
]};
const threeInQueue = { queue: [
  { key: item1Key, message: item1Msg },
  { key: item2Key, message: item2Msg },
  { key: item3Key, message: item3Msg }
]};

describe('dequeue', () => {

  it('is importable', () => {
    expect(dequeue).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof dequeue).toBe('function');
  });

  it(`doesn't remove anything if list is empty`, () => {
    let prevState = emptyQueue;
    let newState = dequeue(item1Key)(prevState);
    expect(newState.queue).toEqual([]);
  });

  it(`removes a queue entry if key matches`, () => {
    let prevState = oneInQueue;
    let newState = dequeue(item1Key)(oneInQueue);
    expect(newState.queue).toEqual([]);
  });

  it('removes only the queue entry whose key matches', () => {
    let prevState = threeInQueue;

    let newState1 = dequeue(item1Key)(prevState);
    expect(newState1.queue).toEqual([
      { key: item2Key, message: item2Msg },
      { key: item3Key, message: item3Msg }
    ]);

    let newState2 = dequeue(item2Key)(prevState);
    expect(newState2.queue).toEqual([
      { key: item1Key, message: item1Msg },
      { key: item3Key, message: item3Msg }
    ]);

    let newState3 = dequeue(item3Key)(prevState);
    expect(newState3.queue).toEqual([
      { key: item1Key, message: item1Msg },
      { key: item2Key, message: item2Msg }
    ]);
  });

  it('returns the same list if "key" is not found in queue', () => {
    let newState1 = dequeue(notInListKey)(emptyQueue);
    expect(newState1).toEqual(emptyQueue);

    let newState2 = dequeue(notInListKey)(oneInQueue);
    expect(newState2).toEqual(oneInQueue);

    let newState3 = dequeue(notInListKey)(twoInQueue);
    expect(newState3).toEqual(twoInQueue);

    let newState4 = dequeue(notInListKey)(threeInQueue);
    expect(newState4).toEqual(threeInQueue);
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
    it(`defaults queue to [] if "state" = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = dequeue(item1Key)(prevState);
      expect(newState.queue).toEqual([]);
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
    it(`defaults queue to [] if state.queue = ${queueVal}`, () => {
      let prevState = { queue: queueVal };
      let newState = dequeue(item1Key)(prevState);
      expect(newState.queue).toEqual([]);
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
    it(`returns the same list if "key" = ${val}`, () => {
      let prevState1 = emptyQueue;
      let newState1 = dequeue(val)(prevState1);
      expect(newState1.queue).toEqual(prevState1.queue);

      let prevState2 = oneInQueue;
      let newState2 = dequeue(val)(prevState2);
      expect(newState2.queue).toEqual(prevState2.queue);
    });
  });

});
