const	config = {

	apiUrl: undefined,
	schemaName: undefined,
	displayField: undefined,
	groupByField: undefined,
	relationshipType: undefined,
	thisEntity: {
		id: undefined,
		name: undefined,
		collectionName: undefined,
		intersectAttr: undefined,
	},
	relatedEntity: {
		name: undefined,
		collectionName: undefined,
		primaryIdAttr: undefined,
	},

	hasRequiredProps: function() {
		return !!(
			this.apiUrl &&
			this.schemaName &&
			this.displayField &&
			this.thisEntity &&
			this.thisEntity.name &&
			this.thisEntity.id
		);
	}
};

export default config;
