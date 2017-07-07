import React, { Component } from 'react';
import styled from 'styled-components';
import groupBy from 'lodash.groupby';

import Notification from './components/Notification';
import Records from './components/Records';
import GroupedRecords from './components/GroupedRecords';

import Config from './modules/Config';
import {
	getParam,
	getRelationshipMetadata,
	getEntityMetadata,
	getRelatedEntityRecords,
	getCurrentlyAssociated,
	getFieldType,
	getOptionSetOptions,
	associateInPort,
	disassociateInPort
} from './modules/Helper';

const StyledApp = styled.div`
	height: 100%;
	text-align: left;
	font-family: 'Segoe UI';
	font-size: 12px;
	color: #111;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	pointer-events: ${({ready}) => ready ? 'auto' : 'none'};
`;

const ContentPanel = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow: auto;
	padding-bottom: 1rem;
`;

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			queue: [],
			records: [],
			associated: []
		};
		this.addError = this.addError.bind(this);
		this.addQueue = this.addQueue.bind(this);
		this.removeQueue = this.removeQueue.bind(this);
		this.associate = this.associate.bind(this);
		this.disassociate = this.disassociate.bind(this);
		this.getData = this.getData.bind(this);
		this.getId = this.getId.bind(this);
		this.getGroupedRecords = this.getGroupedRecords.bind(this);
		this.isReady= this.isReady.bind(this);
	}

	/**
	 * "Actions" and "Reducers"
	 */

	addError(message, cb) {
		let errors = this.state.errors.slice(0,);
		errors.push(message);
		this.setState({ errors }, cb);
	}

	addQueue(message, cb) {
		let key = Date.now();
		let queue = this.state.queue.slice(0,);
		queue.push({ key, message });
		this.setState({ queue }, cb);
		return key;
	}

	removeQueue(key, cb) {
		let queue = this.state.queue.slice(0,);
		let cleanedQueue = queue.filter(el => el.key !== key);
		this.setState({ queue: cleanedQueue }, cb);
	}

	associate(recordId, cb) {
		let queueKey = this.addQueue('Associating...');

		associateInPort(recordId, Config)
			.then(resp => {
				let associated = this.state.associated.slice(0,);
				associated.push(recordId);
				this.setState({ associated }, () => {
					this.removeQueue(queueKey);
					cb && cb();
				});
			})
			.catch(err => {
				console.error(err);
				this.addError('Associate failed');
			});

	}

	disassociate(recordId, cb) {
		let queueKey = this.addQueue('Disassociating...');

		disassociateInPort(recordId, Config)
			.then(resp => {
				let associated = this.state.associated.filter(id => id !== recordId);
				this.setState({ associated }, () => {
					this.removeQueue(queueKey);
				});
			})
			.catch(err => {
				console.error(err);
				this.addError('Disassociate failed');
			});
	}

	/**
	 * Lifecycle hooks
	 */

	componentWillMount() {
		try {
			let data = this.getData(window.location.search);

			if (!data) {
				throw new Error('Missing web resource data');
			}

			Config.init(this.props.xrm, data);

			let thisEntName = getParam(window.location.search, 'typename');
			let thisEntId = this.getId(window.location.search);

			Config.thisEntName = thisEntName;
			Config.thisEntId = thisEntId && thisEntId.replace(/{|}/g, '');
		} catch (err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	componentDidMount() {
		let c = Config;

		if (!c || !c.initIsSuccessful()) {
			this.addError('Config is improperly configured.');
			return;
		}

		let relationshipMetadataKey = this.addQueue('Getting relationship metadata');
		let thisEntMetadataKey = this.addQueue('Getting this entity metadata');
		let relatedEntMetadataKey = this.addQueue('Getting related entity metadata');
		let relatedEntRecordsKey = this.addQueue('Getting related entity records');
		let currentlyAssociatedRecordsKey = this.addQueue('Getting currently associated records');

		// Start the promise chain by getting info about the N:N relationship, ...
		getRelationshipMetadata(c.api, c.schemaName)

			// ... and store them in the config.
			.then(metadata => {
				this.removeQueue(relationshipMetadataKey);

				if (!metadata) {
					throw new Error('Cannot get relationship metadata');
				}

				c.configure(metadata);
			})

			// Get info about this entity, ...
			.then(() => {
				let select = [
					'LogicalCollectionName'
				];

				return getEntityMetadata(c.api, c.thisEntName, select);
			})

			// ... and store them in the config.
			.then(metadata => {
				this.removeQueue(thisEntMetadataKey);

				if (!metadata) {
					throw new Error('Cannot get entity metadata for ', c.thisEntName);
				}

				c.thisEntCollName = metadata.LogicalCollectionName;
			})

			// Get info about the related entity, ...
			.then(() => {
				let select = [
					'PrimaryIdAttribute',
					'LogicalCollectionName'
				];

				return getEntityMetadata(c.api, c.relatedEntName, select);
			})

			// ... and store them in the config.
			.then(metadata => {
				this.removeQueue(relatedEntMetadataKey);

				if (!metadata) {
					throw new Error('Cannot get entity metadata for ', c.relatedEntName);
				}

				c.relatedEntPrimaryIdAttr = metadata.PrimaryIdAttribute;
				c.relatedEntCollName = metadata.LogicalCollectionName;
			})

			// Get the related entity records, ...
			.then(() => {

				let select = [
					c.relatedEntPrimaryIdAttr,
					c.displayField,
					c.groupByField || ''
				].filter(entry => entry);

				return getRelatedEntityRecords(c.api, c.relatedEntCollName, select);
			})

			// ... and (group and) store them in the state.
			.then(records => {
				this.removeQueue(relatedEntRecordsKey);

				if (!records) {
					throw new Error('Cannot get related entity records');
				}

				let sortedGroupedRecords = this.getGroupedRecords(records, c.groupByField);

				this.setState({ records: sortedGroupedRecords || records }, this.mapGroupName);
			})

			// Get currently associated related records, ...
			.then(() => {
				return getCurrentlyAssociated(
					c.api,
					c.thisEntCollName,
					c.thisEntId,
					c.schemaName,
					[c.relatedEntPrimaryIdAttr]
				);
			})

			// ... and store them in the state.
			.then(records => {
				this.removeQueue(currentlyAssociatedRecordsKey);

				if (records) {
					let ids = records.map(record => record[c.relatedEntPrimaryIdAttr]);
					this.setState({ associated: ids });
				}
			})

			.catch(err => {
				this.addError(err.message);
			});
	}

	/**
	 * Helpers
	 */

	getData(url) {
		try {
			let data = getParam(url, 'data');
			return JSON.parse(decodeURIComponent(data));
		} catch (err) {
			console.error(err);
			this.addError('Error in parsing extra data. Is it passed in as an encoded string?')
		}
	}

	getId(url) {
		try {
			let data = getParam(url, 'id');
			return decodeURIComponent(data).replace(/{|}/g, '');
		} catch (err) {
			console.error(err);
			this.addError('Error in parsing id. Is it passed in as query?')
		}
	}

	getGroupedRecords(records, groupByField) {
		let result = undefined;
		if (groupByField) {
			let groupingKey = this.addQueue('Grouping records');
			let groupedRecords = groupBy(records, groupByField);
			let sortedKeys = Object.keys(groupedRecords).sort();

			result = sortedKeys.map(key => ({
				name: key,
				list: groupedRecords[key]
			}));
			this.removeQueue(groupingKey);
		}
		return result;
	}

	mapGroupName() {
		if (!Config.groupByField) {
			return;
		}

		let fieldTypeKey = this.addQueue('Getting field type of group-by field');
		let optionSetKey = this.addQueue('Getting option set for group name');

		// Start a promise chain by getting info on a field, ...
		getFieldType(Config.api, Config.relatedEntName, Config.groupByField)

			// then get the optionset options.
			.then(type => {
				this.removeQueue(fieldTypeKey);

				if (!type || type.toLowerCase() !== 'picklist') {
					this.removeQueue(optionSetKey);
					return;
				}

				return getOptionSetOptions(Config.api, Config.relatedEntName, Config.groupByField);
			})

			// Go through each group and change the name of it to the label of the option.
			.then(options => {
				this.removeQueue(optionSetKey);

				if (!options) {
					return;
				}

				let groupedRecords = this.state.records;

				groupedRecords.forEach(group => {
					if (group.name === 'null' || group.name === 'undefined' || group.name === '') {
						group.name = 'Unknown';
					} else {
						// eslint-disable-next-line
						let option = options.find(opt => opt.Value.toString() == group.name.toString());

						if (option) {
							group.name = option.Label.UserLocalizedLabel.Label;
						}
					}
				});

				this.setState({ records: groupedRecords });
			})

			.catch(err => {
				console.error(err);
				this.addError(err.message);
			});
	}

	isReady(errors, queue) {
		return errors.length <= 0 && queue.length <= 0;
	}

	/**
	 * Render
	 */

  render() {
		let { records, errors, queue, associated } = this.state;
		let ready = this.isReady(errors, queue);

    return (
      <StyledApp className="app" ready={ready}>
				<ContentPanel className="content-panel">
					{
						Config.groupByField ?
							<GroupedRecords
								ready={ready}
								config={Config}
								list={records}
								associated={associated}
								associate={this.associate}
								disassociate={this.disassociate}
							/> :
							<Records
								ready={ready}
								config={Config}
								list={records}
								associated={associated}
								associate={this.associate}
								disassociate={this.disassociate}
							/>
					}
				</ContentPanel>
				<Notification
					errors={this.state.errors}
					queue={this.state.queue} />
      </StyledApp>
    );
  }
}

export default App;
