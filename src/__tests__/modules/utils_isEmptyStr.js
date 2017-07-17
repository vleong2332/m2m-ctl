import { isNonEmptyStr } from '../../modules/Utils';

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
