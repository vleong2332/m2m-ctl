import Ajax from './Ajax';

export function getParam(encodedUrl, paramName) {
	let params = encodedUrl.substr(1).split('&');
	if (params.length <= 0) {
		return;
	}
	let dataParam = params
		.map(param => {
			return param.replace(/\+/g, ' ').split('=');
		})
		.find(splitParam => {
			return splitParam && splitParam[0] === paramName;
		});
	return dataParam && dataParam.length > 1 ? dataParam[1] : undefined;
}

export function getRelationshipMetadata(api, schemaName) {
	return Ajax.getWithPromise(`${api}/RelationshipDefinitions?` +
		`$filter=SchemaName eq '${schemaName}'`
	)
		.then(resp => resp && JSON.parse(resp).value[0])
		.catch(console.error);
}

export function getEntityMetadata(api, entityName, select) {
	return Ajax.getWithPromise(`${api}/EntityDefinitions?` +
		`$select=${select.join(',')}&` +
		`$filter=LogicalName eq '${entityName}'`
	)
		.then(resp => resp && JSON.parse(resp).value[0])
		.catch(console.error);
}

export function getRelatedEntityRecords(api, collectionName, select) {
	return Ajax.getWithPromise(`${api}/${collectionName}?` +
		`$select=${select.join(',')}&` +
		`$filter=statecode eq 0`
	)
		.then(resp => resp && JSON.parse(resp).value)
		.catch(console.error);
}

export function getCurrentlyAssociated(api, collectionName, id, schemaName, select) {
	return Ajax.getWithPromise(`${api}/${collectionName}(${id})/${schemaName}?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp).value);
}


export function associateInPort(recordId, config) {
	let { api, schemaName, thisEntCollName, thisEntId, relatedEntCollName } = config;

	return Ajax.postWithPromise(
		`${api}/${thisEntCollName}(${thisEntId})/${schemaName}/$ref`,
		JSON.stringify({ '@odata.id':`${api}/${relatedEntCollName}(${recordId})` })
	)
		.then(resp => resp, error => error)
		.catch(console.error);
}

export function disassociateInPort(recordId, config) {
	let { api, schemaName, thisEntId, thisEntCollName } = config;

	return Ajax.deleteWithPromise(
		`${api}/${thisEntCollName}(${thisEntId})/${schemaName}(${recordId})/$ref`,
	)
		.then(resp => resp, error => error)
		.catch(console.error);
}
