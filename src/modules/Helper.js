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
	return Ajax.getWithPromise(`${api}/RelationshipDefinitions(SchemaName='${schemaName}')`)
		.then(resp => resp && JSON.parse(resp))
		.catch(console.error);
}

export function getEntityMetadata(api, entityName, select) {
	return Ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entityName}')?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp))
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

export function getFieldType(api, entName, fieldName) {
	return Ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes(LogicalName='${fieldName}')?` +
		`$select=AttributeType`
	)
		.then(resp => resp && JSON.parse(resp).AttributeType)
		.catch(console.error);
}

export function getOptionSetOptions(api, entName, fieldName) {
	return Ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?` +
		`$filter=LogicalName eq '${fieldName}'&` +
		`$expand=OptionSet`
	)
		.then(resp => resp && JSON.parse(resp).value[0].OptionSet.Options)
		.catch(console.error)
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
