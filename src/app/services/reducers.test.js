import {
  addAssociated,
  removeAssociated,
  enqueue,
  dequeue,
  addError,
  defaultQueue,
  defaultError,
} from './reducers';

describe('addAssociated', () => {

  const newRecordId = '123';
  const initRecordId = '456';

  it('is importable', () => {
    expect(addAssociated).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof addAssociated).toBe('function');
  });

  it('adds a record id to an empty list', () => {
    let prevState = { associatedIds: [] };
    let newState = addAssociated(newRecordId)(prevState);
    expect(newState.associatedIds).toEqual([ newRecordId ]);
  });

  it('adds a record id to a non-empty list', () => {
    let prevState = { associatedIds: [ initRecordId ] };
    let newState = addAssociated(newRecordId)(prevState);
    expect(newState.associatedIds).toEqual([ initRecordId, newRecordId ]);
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
    it(`defaults state.associatedIds to [] if state = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = addAssociated(newRecordId)(prevState);
      expect(newState.associatedIds).toEqual([ newRecordId ]);
    });
  });

  // Invalid "associated" property
  [
    undefined, null,
    true, false,
    {},
    0, 1, -1,
    0.0, 1.1, -1.1,
    'abc', '', '   ',
  ]
  .forEach(associatedVal => {
    it(`defaults state.associatedIds to [] if it = ${associatedVal}`, () => {
      let prevState = { errors: associatedVal };
      let newState = addAssociated(newRecordId)(prevState);
      expect(newState.associatedIds).toEqual([ newRecordId ]);
    });
  });

});

describe('addError', () => {

  const newError = 'New error';
  const initError = 'Init error';
  const emptyErrors = { errors: [] };

  it('is importable', () => {
    expect(addError).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof addError).toBe('function');
  });

  it('adds error entry to an empty list', () => {
    let prevState = emptyErrors;
    let newState = addError(newError)(prevState);
    expect(newState.errors).toEqual([ newError ]);
  });

  it('adds error entry to a non-empty list', () => {
    let prevState = { errors: [ initError ] };
    let newState = addError(newError)(prevState);
    expect(newState.errors).toEqual([ initError, newError ]);
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
    it(`defaults state.errors to [] if state = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = addError(newError)(prevState);
      expect(newState.errors).toEqual([ newError ]);
    });
  });

  // Invalid "errors" property
  [
    undefined, null,
    true, false,
    {},
    0, 1, -1,
    0.0, 1.1, -1.1,
    'abc', '', '   ',
  ]
  .forEach(errorsVal => {
    it(`defaults state.errors to [] if state.errors = ${errorsVal}`, () => {
      let prevState = { errors: errorsVal };
      let newState = addError(newError)(prevState);
      expect(newState.errors).toEqual([ newError ]);
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
  .forEach(messageVal => {
    it(`sets message to default if message = ${messageVal}`, () => {
      let prevState = emptyErrors;
      let newState = addError(messageVal)(prevState);
      expect(newState.errors).toEqual([ defaultError ]);
    });
  });

  // Valid "message" args
  ['message', ' message ', 'a message', ' a message ']
  .forEach(messageVal => {
    it(`accepts ${messageVal} as "message" arg`, () => {
      let prevState = emptyErrors;
      let newState = addError(messageVal)(prevState);
      expect(newState.errors).toEqual([ messageVal ]);
    });
  });

});

describe('dequeue', () => {

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
    let newState = dequeue(item1Key)(prevState);
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

describe('removeAssociated', () => {

  const recordId1 = 123;
  const recordId2 = 456;
  const recordId3 = 789;
  const recordIdNotInList = 999;

  const emptyAssociated = { associatedIds: [] };
  const oneInAssociated = { associatedIds: [recordId1] };
  const twoInAssociated = { associatedIds: [recordId1, recordId2] };
  const threeInAssociated = { associatedIds: [recordId1, recordId2, recordId3] };

  it('is importable', () => {
    expect(removeAssociated).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof removeAssociated).toBe('function');
  });

  it(`doesn't remove anything if list is empty`, () => {
    let prevState = emptyAssociated;
    let newState = removeAssociated(recordId1)(prevState);
    expect(newState.associatedIds).toEqual([]);
  });

  it(`removes a record id if id matches`, () => {
    let prevState = oneInAssociated;
    let newState = removeAssociated(recordId1)(prevState);
    expect(newState.associatedIds).toEqual([]);
  });

  it('removes only the record id whose id matches', () => {
    let prevState = threeInAssociated;

    let newState1 = removeAssociated(recordId1)(prevState);
    expect(newState1.associatedIds).toEqual([ recordId2, recordId3 ]);

    let newState2 = removeAssociated(recordId2)(prevState);
    expect(newState2.associatedIds).toEqual([ recordId1, recordId3 ]);

    let newState3 = removeAssociated(recordId3)(prevState);
    expect(newState3.associatedIds).toEqual([ recordId1, recordId2 ]);
  });

  it('returns the same list if record id is not found in queue', () => {
    let newState1 = removeAssociated(recordIdNotInList)(emptyAssociated);
    expect(newState1).toEqual(emptyAssociated);

    let newState2 = removeAssociated(recordIdNotInList)(oneInAssociated);
    expect(newState2).toEqual(oneInAssociated);

    let newState3 = removeAssociated(recordIdNotInList)(twoInAssociated);
    expect(newState3).toEqual(twoInAssociated);

    let newState4 = removeAssociated(recordIdNotInList)(threeInAssociated);
    expect(newState4).toEqual(threeInAssociated);
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
    it(`defaults associatedIds to [] if "state" = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = removeAssociated(recordId1)(prevState);
      expect(newState.associatedIds).toEqual([]);
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
    it(`defaults associatedIds to [] if state.associatedIds = ${queueVal}`, () => {
      let prevState = { associatedIds: queueVal };
      let newState = removeAssociated(recordId1)(prevState);
      expect(newState.associatedIds).toEqual([]);
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
    it(`returns the same list if record id = ${val}`, () => {
      let prevState1 = emptyAssociated;
      let newState1 = removeAssociated(val)(prevState1);
      expect(newState1.queue).toEqual(prevState1.queue);

      let prevState2 = oneInAssociated;
      let newState2 = removeAssociated(val)(prevState2);
      expect(newState2.queue).toEqual(prevState2.queue);
    });
  });

});
