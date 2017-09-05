import ajax from 'services/ajax';

export function getRelationshipMetadata(apiUrl, schemaName) {
	return ajax.getWithPromise(`${apiUrl}/RelationshipDefinitions(SchemaName='${schemaName}')`)
		.then(resp => resp && JSON.parse(resp));
}

export function getEntityMetadata(apiUrl, entityName, select) {
	return ajax.getWithPromise(`${apiUrl}/EntityDefinitions(LogicalName='${entityName}')?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp))
		.catch(console.error);
}

export function getRelatedEntityRecords(apiUrl, collectionName, select) {
	return ajax.getWithPromise(`${apiUrl}/${collectionName}?` +
		`$select=${select.join(',')}&` +
		`$filter=statecode eq 0`
	)
		.then(resp => resp && JSON.parse(resp).value)
		.catch(console.error);
}

export function getCurrentlyAssociated(apiUrl, collectionName, id, schemaName, select) {
	return ajax.getWithPromise(`${apiUrl}/${collectionName}(${id})/${schemaName}?` +
		`$select=${select.join(',')}`
	)
		.then(resp => resp && JSON.parse(resp).value);
}

export function getFieldType(apiUrl, entName, fieldName) {
	return ajax.getWithPromise(`${apiUrl}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes(LogicalName='${fieldName}')?` +
		`$select=AttributeType`
	)
		.then(resp => resp && JSON.parse(resp).AttributeType)
		.catch(error => { throw error; });
}

export function getOptionSetOptions(apiUrl, entName, fieldName) {
	return ajax.getWithPromise(`${apiUrl}/EntityDefinitions(LogicalName='${entName}')` +
		`/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?` +
		`$filter=LogicalName eq '${fieldName}'&` +
		`$expand=OptionSet`
	)
		.then(resp => resp && JSON.parse(resp).value[0].OptionSet.Options)
		.catch(error => { throw error; });
}

export function associateInPort(recordId, config) {
	let { apiUrl, schemaName, thisEntity, relatedEntity } = config;

	return ajax.postWithPromise(
		`${apiUrl}/${thisEntity.collectionName}(${thisEntity.id})/${schemaName}/$ref`,
		JSON.stringify({ '@odata.id':`${apiUrl}/${relatedEntity.collectionName}(${recordId})` })
	);
}

export function disassociateInPort(recordId, config) {
	let { apiUrl, schemaName, thisEntity } = config;

	return ajax.deleteWithPromise(
		`${apiUrl}/${thisEntity.collectionName}(${thisEntity.id})/${schemaName}(${recordId})/$ref`,
	);
}

export function runAction(actionName, config) {
	// Good gracious. This is an expensive CRM unwritten(?) quirk. For it to work, CRM requires at
	// least one parameter in the action definition. The parameter can be optional. Hence the dummy
	// key and value.
	return ajax.postWithPromise(
		`${config.apiUrl}/${config.thisEntity.collectionName}(${config.thisEntity.id})` +
			`/Microsoft.Dynamics.CRM.${actionName}`,
		JSON.stringify({ 'dummyKey': 'dummyValue' })
	);
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
