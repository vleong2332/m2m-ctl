const	Config = {

	init: function(xrm, { schemaName, displayField, groupByField }) {
		if (!xrm || !schemaName || !displayField) {
			throw new Error(`Config must be initialized with Xrm object, schemaName, and displayField.`);
		}

		let t = this;
		let clientUrl = xrm.Page.context.getClientUrl();

		t.api = `${clientUrl}/api/data/v8.2`;
		t.schemaName = schemaName;
		t.displayField = displayField;
		t.groupByField = groupByField;
		t.relationshipType = undefined;
		t.thisEntId = undefined;
		t.thisEntName = undefined;
		t.thisEntIntersectAttr = undefined;
		t.relatedEntName = undefined;
		t.relatedEntCollName = undefined;
		t.relatedEntPrimaryIdAttr = undefined;
		t.records = [];
	},

	configure: function(metadata) {
		let m = metadata;
		let t = this;

		if (t.thisEntName && !t.thisEntName.trim()) {
			throw new Error('thisEntName must be set before calling configure().');
		}

		if (m.RelationshipType.toLowerCase() !== 'manytomanyrelationship') {
			throw new Error(`${t.schemaName} is not N:N.`);
		}

		t.relationshipType = m.RelationshipType;

		if (
			t.thisEntName === m.Entity1LogicalName &&
			t.thisEntName !== m.Entity2LogicalName
		) {
			t.thisEntIntersectAttr = m.Entity1IntersectAttribute;
			t.relatedEntName = m.Entity2LogicalName;
			t.realtedEntIntersectAttr = m.Entity2IntersectAttribute;
		} else if (
			t.thisEntName !== m.Entity1LogicalName &&
			t.thisEntName === m.Entity2LogicalName
		) {
			t.thisEntIntersectAttr = m.Entity2IntersectAttribute;
			t.relatedEntName = m.Entity1LogicalName;
			t.realtedEntIntersectAttr = m.Entity1IntersectAttribute;
		} else {
			throw new Error(`Cannot determine whether ${t.thisEntName} is Entity1 or Entity2 in ${t.schemaName}`);
		}
	}

};

export default Config;
