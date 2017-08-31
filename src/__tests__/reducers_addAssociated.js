import { addAssociated } from '../reducers';

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
