import { isNonEmptyStr, getParam } from './utils';

describe('isNonEmptyStr()', () => {

  [
    undefined, null,
    true, false,
    {}, [],
    0, 1, -1,
    0.0, 1.1, -1.1,
    '', '   '
  ]
  .forEach(val => {
    it(`returns true for ${val}`, () => {
      expect(isNonEmptyStr(val)).toBe(false);
    });
  });

  ['string', ' string ', 'a string', ' a string ']
  .forEach(val => {
    it(`returns false for ${val}`, () => {
      expect(isNonEmptyStr(val)).toBe(true);
    });
  });

});


describe('getParam', () => {

	let q = `?test=is+a+test`;

	it('is importable', () => {
		expect(getParam).toBeDefined();
	});

	it('is a function', () => {
		expect(typeof getParam === 'function').toBe(true);
	});

	it('should return the value of the param in a query string', () => {
		expect(getParam(q, 'test')).toBe('is a test');
	});

	it('should return undefined if the param is not found in a query string', () => {
		expect(getParam(q, 'not_test')).toBeUndefined();
	});

	it('should return undefined if there is no query string', () => {
		expect(getParam('', 'test')).toBeUndefined();
	});

	it('should return undefined if there is no param name to be searched for', () => {
		expect(getParam(q, '')).toBeUndefined();
	});

	it('should return undefined if there is no query string nor param name', () => {
		expect(getParam('', '')).toBeUndefined();
	});

});
