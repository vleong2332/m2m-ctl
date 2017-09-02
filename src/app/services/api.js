import ajax from 'services/ajax';

export function getRelationshipMetadata(api, schemaName) {
	return ajax.getWithPromise(`${api}/RelationshipDefinitions(SchemaName='${schemaName}')`)
		.then(resp => resp && JSON.parse(resp))
		.catch(console.error);
}

export function getEntityMetadata(api, entityName, select) {
	return ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entityName}')?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp))
		.catch(console.error);
}

export function getRelatedEntityRecords(api, collectionName, select) {
	return ajax.getWithPromise(`${api}/${collectionName}?` +
		`$select=${select.join(',')}&` +
		`$filter=statecode eq 0`
	)
		.then(resp => resp && JSON.parse(resp).value)
		.catch(console.error);
}

export function getCurrentlyAssociated(api, collectionName, id, schemaName, select) {
	return ajax.getWithPromise(`${api}/${collectionName}(${id})/${schemaName}?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp).value);
}

export function getFieldType(api, entName, fieldName) {
	return ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes(LogicalName='${fieldName}')?` +
		`$select=AttributeType`
	)
		.then(resp => resp && JSON.parse(resp).AttributeType)
		.catch(console.error);
}

export function getOptionSetOptions(api, entName, fieldName) {
	return ajax.getWithPromise(`${api}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?` +
		`$filter=LogicalName eq '${fieldName}'&` +
		`$expand=OptionSet`
	)
		.then(resp => resp && JSON.parse(resp).value[0].OptionSet.Options)
		.catch(console.error)
}

export function associateInPort(recordId, config) {
	let { api, schemaName, thisEntCollName, thisEntId, relatedEntCollName } = config;

	return ajax.postWithPromise(
		`${api}/${thisEntCollName}(${thisEntId})/${schemaName}/$ref`,
		JSON.stringify({ '@odata.id':`${api}/${relatedEntCollName}(${recordId})` })
	)
		.then(resp => { console.log('directly', resp); return resp; }, error => error)
		.catch(console.error);
}

export function disassociateInPort(recordId, config) {
	let { api, schemaName, thisEntId, thisEntCollName } = config;

	return ajax.deleteWithPromise(
		`${api}/${thisEntCollName}(${thisEntId})/${schemaName}(${recordId})/$ref`,
	)
		.then(resp => resp, error => error)
		.catch(console.error);
}

export function runAction(entityName, entityId, actionName, config) {
	// Good gracious. This is an expensive CRM unwritten(?) quirk. For it to work, CRM requires at
	// least one parameter in the action definition. The parameter can be optional. Hence the dummy
	// key and value.
	return ajax.postWithPromise(
		`${config.api}/${entityName}(${entityId})/Microsoft.Dynamics.CRM.${actionName}`,
		JSON.stringify({ 'dummyKey': 'dummyValue' })
	)
		.then(resp => resp, error => error)
		.catch(console.error);
}


const Helper = {
	getRelationshipMetadata,
	getEntityMetadata,
	getRelatedEntityRecords,
	getCurrentlyAssociated,
	getFieldType,
	getOptionSetOptions,
	associateInPort,
	disassociateInPort,
	runAction,
};

export default Helper;
