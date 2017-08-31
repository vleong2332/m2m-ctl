export function isNonEmptyStr(str) {
  return !!(typeof str === 'string' && str.trim());
};

export function fillArray(item, times) {
  const array = [];
  for (let i = 0; i < times; i++) {
    array.push(item);
  }
  return array;
}
