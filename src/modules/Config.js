const	Config = {

	init: function({ schemaName, displayField }) {
		let t = this;

		if (!schemaName || !displayField) {
			throw new Error(`init() must have schemaName and displayField.`);
		}
		t.api = 'https://portmgt-test.crm.dynamics.com/api/data/v8.2';
		t.schemaName = schemaName;
		t.displayField = displayField;
		t.relationshipType = undefined;
		t.thisEntName = undefined;
		t.thisEntPrimaryIdAttr = undefined;
		t.thisEntIntersectAttr = undefined;
		t.relatedEntName = undefined;
		t.relatedEntCollName = undefined;
		t.relatedEntPrimaryIdAttr = undefined;
		t.relatedEntIntersectAttr = undefined;
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
