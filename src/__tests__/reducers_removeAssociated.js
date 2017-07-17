import { removeAssociated } from '../reducers';

const recordId1 = 123;
const recordId2 = 456;
const recordId3 = 789;
const recordIdNotInList = 999;

const emptyAssociated = { associated: [] };
const oneInAssociated = { associated: [recordId1] };
const twoInAssociated = { associated: [recordId1, recordId2] };
const threeInAssociated = { associated: [recordId1, recordId2, recordId3] };

describe('removeAssociated', () => {

  it('is importable', () => {
    expect(removeAssociated).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof removeAssociated).toBe('function');
  });

  it(`doesn't remove anything if list is empty`, () => {
    let prevState = emptyAssociated;
    let newState = removeAssociated(recordId1)(prevState);
    expect(newState.associated).toEqual([]);
  });

  it(`removes a record id if id matches`, () => {
    let prevState = oneInAssociated;
    let newState = removeAssociated(recordId1)(oneInAssociated);
    expect(newState.associated).toEqual([]);
  });

  it('removes only the record id whose id matches', () => {
    let prevState = threeInAssociated;

    let newState1 = removeAssociated(recordId1)(prevState);
    expect(newState1.associated).toEqual([ recordId2, recordId3 ]);

    let newState2 = removeAssociated(recordId2)(prevState);
    expect(newState2.associated).toEqual([ recordId1, recordId3 ]);

    let newState3 = removeAssociated(recordId3)(prevState);
    expect(newState3.associated).toEqual([ recordId1, recordId2 ]);
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
    it(`defaults associated to [] if "state" = ${stateVal}`, () => {
      let prevState = stateVal;
      let newState = removeAssociated(recordId1)(prevState);
      expect(newState.associated).toEqual([]);
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
    it(`defaults associated to [] if state.associated = ${queueVal}`, () => {
      let prevState = { associated: queueVal };
      let newState = removeAssociated(recordId1)(prevState);
      expect(newState.associated).toEqual([]);
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
