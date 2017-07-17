export function isNonEmptyStr(str) {
  return !!(typeof str === 'string' && str.trim());
};
