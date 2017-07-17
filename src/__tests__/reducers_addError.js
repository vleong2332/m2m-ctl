import { addError, defaultError } from '../reducers';

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
