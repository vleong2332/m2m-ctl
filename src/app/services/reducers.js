import { isNonEmptyStr } from 'services/utils';

export const defaultError = 'Unknown error';
export const defaultQueue = 'Please wait';

export const addError = message => (prevState, _) => {
  let errors =
    prevState && prevState.errors && Array.isArray(prevState.errors)
    ? prevState.errors.slice(0,)
    : [];

  message = isNonEmptyStr(message) ? message : defaultError;
  errors.push(message);
  return { errors };
};

export const enqueue = (key, message) => (prevState, _) => {
  let queue =
    prevState && prevState.queue && Array.isArray(prevState.queue)
    ? prevState.queue.slice(0,)
    : [];

  if (typeof key === 'number' || isNonEmptyStr(key)) {
    message = isNonEmptyStr(message) ? message : defaultQueue;
    queue.push({ key, message });
  }

  return { queue };
};

export const dequeue = key => (prevState, _) => {
  let queue =
    prevState && prevState.queue && Array.isArray(prevState.queue)
    ? prevState.queue.slice(0,)
    : [];

  if (queue.length && (typeof key === 'number' || isNonEmptyStr(key))) {
    queue = queue.filter(el => el.key !== key);
  }

  return { queue };
};

export const addAssociated = recordId => (prevState, _) => {
  let associatedIds =
    prevState && prevState.associatedIds && Array.isArray(prevState.associatedIds)
    ? prevState.associatedIds.slice(0,)
    : [];

  associatedIds.push(recordId);
  return { associatedIds };
};

export const removeAssociated = recordId => (prevState, _) => {
  let associatedIds =
    prevState && prevState.associatedIds && Array.isArray(prevState.associatedIds)
    ? prevState.associatedIds.slice(0,)
    : [];

  return { associatedIds: associatedIds.filter(id => id !== recordId) };
};

const reducers = {
  defaultError,
  defaultQueue,
  addError,
  enqueue,
  dequeue,
  addAssociated,
  removeAssociated,
};

export default reducers;
