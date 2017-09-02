import { getParam } from 'services/utils';
import groupBy from 'lodash.groupby';

export function getExtraData(url) {
  try {
    let data = getParam(url, 'data');
    return JSON.parse(decodeURIComponent(data));
  } catch (err) {
    console.error(err);
    this.addError('Error in parsing extra data. Is it passed in as an encoded string?')
  }
}

export function getId(url) {
  try {
    let data = getParam(url, 'id');
    return decodeURIComponent(data).replace(/{|}/g, '');
  } catch (err) {
    console.error(err);
    this.addError('Error in parsing id. Is it passed in as query?')
  }
}

export function getGroupedRecords(records, groupByField) {
  let result;
  if (groupByField) {
    let statusMessageKey = this.addQueue('Grouping records');
    let groupedRecords = groupBy(records, groupByField);
    let sortedGroups = Object.keys(groupedRecords).sort();

    result = sortedGroups.map(key => ({
      name: key,
      list: groupedRecords[key]
    }));

    this.removeQueue(statusMessageKey);
  }
  return result;
}

export function isReady(errors, queue) {
  return errors.length <= 0 && queue.length <= 0;
}
