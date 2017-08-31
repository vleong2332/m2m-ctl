import React, { Component } from 'react';
import groupBy from 'lodash.groupby';

import reducers from '../reducers';
import Config from '../modules/Config';
import Helper from '../modules/Helper';

import M2MControl from '../components/M2MControl';

import { FILTER_ALL, FILTER_SELECTED, FILTER_UNSELECTED } from '../modules/Constant.js';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			currentFilter: FILTER_ALL,
			errors: [],
			queue: [],
			records: [],
			associatedIds: []
		};
		this.addError = this.addError.bind(this);
		this.addQueue = this.addQueue.bind(this);
		this.removeQueue = this.removeQueue.bind(this);
		this.associate = this.associate.bind(this);
		this.disassociate = this.disassociate.bind(this);
		this.switchFilter = this.switchFilter.bind(this);
		this.getExtraData = this.getExtraData.bind(this);
		this.getId = this.getId.bind(this);
		this.getGroupedRecords = this.getGroupedRecords.bind(this);
		this.isReady= this.isReady.bind(this);
	}

	/**
	 * State modifiers
	 */

	addError(message) {
		this.setState(reducers.addError(message));
	}

	addQueue(message) {
		let key = Date.now();
		this.setState(reducers.enqueue(key, message));
		return key;
	}

	removeQueue(key) {
		this.setState(reducers.dequeue(key));
	}

	async associate(recordId) {
		let statusMessageKey = this.addQueue('Associating...');

		try {
			await Helper.associateInPort(recordId, Config);
			this.setState(reducers.addAssociated(recordId), () => {
				this.removeQueue(statusMessageKey);
			});
		} catch(err) {
			console.error(err);
			this.addError('Associate failed');
		}
	}

	async disassociate(recordId) {
		let statusMessageKey = this.addQueue('Disassociating...');

		try {
			await Helper.disassociateInPort(recordId, Config);
			this.setState(reducers.removeAssociated(recordId), () => {
				console.log('DISASSOCIATED IDS', this.state.associatedIds);
				this.removeQueue(statusMessageKey);
			});
		} catch(err) {
			console.error(err);
			this.addError('Disassociate failed');
		}
	}

	switchFilter(val) {
		let newFilter = val !== FILTER_SELECTED && val !== FILTER_UNSELECTED
			? FILTER_ALL
			: val;
		this.setState({ currentFilter: newFilter });
	}

	/**
	 * Lifecycle hooks
	 */

	componentWillMount() {
		try {
			const searchString = window.location.search;
			const extraData = this.getExtraData(searchString);

			if (!extraData) {
				throw new Error('Missing web resource data');
			}

			Config.init(this.props.xrm, extraData);
			Config.thisEntName = Helper.getParam(searchString, 'typename');;

			const thisEntId = this.getId(searchString);
			Config.thisEntId = thisEntId && thisEntId.replace(/{|}/g, '');
		} catch (err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	async componentDidMount() {
		const c = Config;

		if (!c || !c.initIsSuccessful()) {
			this.addError('Config is improperly cofigured.');
			return;
		}

		let statusMessageKey1;
		let statusMessageKey2;

		try {
			// First batch of requests
			statusMessageKey1 = this.addQueue('Getting relationship metadata');
			statusMessageKey2 = this.addQueue('Getting this entity metadata');
			const [
				relationshipMetadata,
				thisEntMetadata,
			] = await Promise.all([
				Helper.getRelationshipMetadata(c.api, c.schemaName),
				Helper.getEntityMetadata(c.api, c.thisEntName, [ 'LogicalCollectionName' ]),
			]);
			this.removeQueue(statusMessageKey1);
			this.removeQueue(statusMessageKey2);
			this.handleRelationshipMetadata(relationshipMetadata);
			this.handleThisEntMetadata(thisEntMetadata);

			// Second batch of requests
			statusMessageKey1 = this.addQueue('Getting related entity metadata');
			const relatedEntMetadata = await Helper.getEntityMetadata(c.api, c.relatedEntName, [
				'PrimaryIdAttribute',
				'LogicalCollectionName'
			]);
			this.removeQueue(statusMessageKey1);
			this.handleRelatedEntMetadata(relatedEntMetadata);

			// Third batch of requests
			statusMessageKey1 = this.addQueue('Getting related entity records');
			statusMessageKey2 = this.addQueue('Getting currently associated records');
			const [
				relatedEntities,
				associatedRecords,
			] = await Promise.all([
				Helper.getRelatedEntityRecords(c.api, c.relatedEntCollName, [
					c.relatedEntPrimaryIdAttr,
					c.displayField,
					c.groupByField || ''
				].filter(entry => entry)),
				Helper.getCurrentlyAssociated(
					c.api,
					c.thisEntCollName,
					c.thisEntId,
					c.schemaName,
					[c.relatedEntPrimaryIdAttr]
				),
			]);
			this.removeQueue(statusMessageKey1);
			this.removeQueue(statusMessageKey2);
			this.handleRelatedEntities(relatedEntities);
			this.handleAssociatedRecords(associatedRecords);

		} catch (err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	/**
	 * Component-specific helpers
	 */

	getExtraData(url) {
		try {
			let data = Helper.getParam(url, 'data');
			return JSON.parse(decodeURIComponent(data));
		} catch (err) {
			console.error(err);
			this.addError('Error in parsing extra data. Is it passed in as an encoded string?')
		}
	}

	getId(url) {
		try {
			let data = Helper.getParam(url, 'id');
			return decodeURIComponent(data).replace(/{|}/g, '');
		} catch (err) {
			console.error(err);
			this.addError('Error in parsing id. Is it passed in as query?')
		}
	}

	getGroupedRecords(records, groupByField) {
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

	async mapGroupName() {
		// There's nothing to map if we're not trying to group the records
		if (!Config.groupByField) {
			return;
		}

		let statusMessageKey;

		try {
			// Get the field type of the group-by field
			statusMessageKey = this.addQueue('Getting field type of group-by field');
			const fieldType = await Helper.getFieldType(Config.api, Config.relatedEntName, Config.groupByField);
			this.removeQueue(statusMessageKey);

			// Currently, we only support picklist/optionset
			if (!fieldType || fieldType.toLowerCase() !== 'picklist') {
				return;
			}

			// Get the optionset
			statusMessageKey = this.addQueue('Getting option set for group name');
			const optionsetOptions = await Helper.getOptionSetOptions(Config.api, Config.relatedEntName, Config.groupByField);
			this.removeQueue(statusMessageKey);

			if (!optionsetOptions) {
				return;
			}

			// Go through each group and change the name of it to the label of the option.
			let groupedRecords = this.state.records.slice();

			groupedRecords.forEach(group => {
				const hasNoName = group.name === 'null' || group.name === 'undefined' || group.name === '';

				if (hasNoName) {
					group.name = 'Unknown';
				} else {
					// eslint-disable-next-line
					let optionset = optionsetOptions.find(opt => opt.Value.toString() == group.name.toString());

					if (optionset) {
						group.name = optionset.Label.UserLocalizedLabel.Label;
					}
				}
			});

			this.setState({ records: groupedRecords });

		} catch(err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	isReady(errors, queue) {
		return errors.length <= 0 && queue.length <= 0;
	}

	handleRelationshipMetadata(data) {
		if (!data) {
			throw new Error('Cannot get relationship metadata');
		}
		Config.configure(data);
	}

	handleThisEntMetadata(data) {
		if (!data) {
			throw new Error('Cannot get entity metadata for ', Config.thisEntName);
		}
		Config.thisEntCollName = data.LogicalCollectionName;
	}

	handleRelatedEntMetadata(data) {
		if (!data) {
			throw new Error('Cannot get entity metadata for ', Config.relatedEntName);
		}
		Config.relatedEntPrimaryIdAttr = data.PrimaryIdAttribute;
		Config.relatedEntCollName = data.LogicalCollectionName;
	}

	handleRelatedEntities(data) {
		if (!data) {
			throw new Error('Cannot get related entity records');
		}
		const sortedGroupedRecords = this.getGroupedRecords(data, Config.groupByField);
		// TODO: Move setState callback to componentDidUpdate
		this.setState({ records: sortedGroupedRecords || data }, this.mapGroupName);
	}

	handleAssociatedRecords(data) {
		if (data) {
			const associatedIds = data.map(record => record[Config.relatedEntPrimaryIdAttr]);
			this.setState({ associatedIds });
		}
	}

	/**
	 * Render
	 */

  render() {
    return (
      <M2MControl
				{...this.state}
				config={Config}
				associate={this.associate}
				disassociate={this.disassociate}
				switchFilter={this.switchFilter}
				isReady={this.isReady(this.state.errors, this.state.queue)}
			/>
    );
  }
}

export default App;
