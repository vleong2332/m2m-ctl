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

export function groupRecords(records, groupByField) {
  let statusMessageKey = this.enqueue('Grouping records');
  let groupedRecords = groupBy(records, groupByField);
  let sortedGroups = Object.keys(groupedRecords).sort();

  this.dequeue(statusMessageKey);
  return sortedGroups.map(key => ({
    name: key,
    list: groupedRecords[key]
  }));
}

export function isReady(errors, queue) {
  return errors.length <= 0 && queue.length <= 0;
}

export function refreshData() {
  this.props.xrm.Page.data.refresh();
}

export function notify(message, severity = 'INFO', timeToLive = 0) {
  const key = Date.now().toString();

  this.props.xrm.Page.ui.setFormNotification(message, severity, key);

  if (timeToLive > 0) {
    setTimeout(() => {
      this.props.xrm.Page.ui.clearFormNotification(key);
    }, timeToLive);
  }
}
