import React, { Component } from 'react';
import styled from 'styled-components';

import Notification from './components/Notification';
import Records from './components/Records';

import Config from './modules/Config';
import {
	getParam,
	getRelationshipMetadata,
	getEntityMetadata,
	getRelatedEntityRecords,
	getCurrentlyAssociated,
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
`;

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			status: 'busy', /* ok, busy, warning, error */
			message: 'Loading',
			records: [],
			associated: []
		};
		this.setMessage = this.setMessage.bind(this);
		// this.addMessage = this.addMessage.bind(this);
		// this.removeMessage = this.removeMessage.bind(this);
		this.associate = this.associate.bind(this);
		this.disassociate = this.disassociate.bind(this);
	}

	/**
	 * "Actions" and "Reducers"
	 */

	setStatus(status, cb) {
		this.setState({ status }, cb);
	}

	setMessage(message, cb) {
		this.setState({ message }, cb);
	}

	// addMessage(content, cb) {
	// 	let messages = this.state.messages.slice(0,);
	// 	messages.push(content);
	// 	this.setState({ messages }, cb);
	// }
	//
	// removeMessage(index, cb) {
	// 	let messages = this.state.messages.slice(0,);
	// 	messages.splice(index, 1);
	// 	this.setState({ messages }, cb);
	// }

	associate(recordId, cb) {
		this.setMessage('Associating...')
		this.setStatus('busy', () => {
			associateInPort(recordId, Config)
				.then(resp => {
					let associated = this.state.associated.slice(0,);
					associated.push(recordId);
					this.setState({ associated }, cb);
					this.setStatus('ok');
					this.setMessage('Ready');
				})
				.catch(err => {
					console.error(err);
					this.setStatus('error');
					this.setMessage('Associate failed');
				});
		});

	}

	disassociate(recordId, cb) {
		this.setMessage('Disassociating...');
		this.setStatus('busy', () => {
			disassociateInPort(recordId, Config)
				.then(resp => {
					let associated = this.state.associated.filter(id => id !== recordId);
					this.setState({ associated }, cb);
					this.setStatus('ok');
					this.setMessage('Ready');
				})
				.catch(err => {
					console.error(err);
					this.setStatus('error');
					this.setMessage('Disassociate failed');
				});
		});
	}

	/**
	 * Lifecycle hooks
	 */

	componentWillMountSucceeds = true;

	componentWillMount() {
		let data = this.getData(window.location.search);
		let thisEntName = getParam(window.location.search, 'typename');
		let thisEntId = this.getId(window.location.search);

		try {
			Config.init(this.props.xrm, data);
		} catch (err) {
			console.error(err);
			this.componentWillMountSucceeds = false;
			return;
		}

		Config.thisEntName = thisEntName;
		Config.thisEntId = thisEntId && thisEntId.replace(/{|}/g, '');

		this.componentWillMountSucceeds = !!(Config.thisEntName && Config.thisEntId);
	}

	componentDidMount() {
		if (!this.componentWillMountSucceeds) {
			this.setStatus('error');
			this.setMessage('Config is improperly configured.');
			return;
		}

		let { api, schemaName, displayField } = Config;
		getRelationshipMetadata(api, schemaName)
			.then(metadata => {
				if (!metadata) {
					throw new Error('Cannot get relationship metadata');
				}
				Config.configure(metadata);
				return getEntityMetadata(api, Config.thisEntName, [
					'LogicalCollectionName'
				]);
			})
			.then(metadata => {
				if (!metadata) {
					throw new Error('Cannot get entity metadata for ', Config.thisEntName);
				}
				Config.thisEntCollName = metadata.LogicalCollectionName;
				return getEntityMetadata(api, Config.relatedEntName, [
					'PrimaryIdAttribute',
					'LogicalCollectionName'
				]);
			})
			.then(metadata => {
				if (!metadata) {
					throw new Error('Cannot get entity metadata for ', Config.relatedEntName);
				}
				Config.relatedEntPrimaryIdAttr = metadata.PrimaryIdAttribute;
				Config.relatedEntCollName = metadata.LogicalCollectionName;
				return getRelatedEntityRecords(api, Config.relatedEntCollName, [
					Config.relatedEntPrimaryIdAttr,
					displayField
				]);
			})
			.then(records => {
				if (!records) {
					throw new Error('Cannot get related entity records');
				}
				Config.records = records;
				this.setState({ records }, () => {
					getCurrentlyAssociated(
						api,
						Config.thisEntCollName,
						Config.thisEntId,
						Config.schemaName,
						[Config.relatedEntPrimaryIdAttr]
					)
						.then(records => {
							if (records) {
								let ids = records.map(record => record[Config.relatedEntPrimaryIdAttr]);
								this.setState({ associated: ids });
							}
							this.setStatus('ok');
							this.setMessage('Ready');
						})
						.catch(err => {
							console.error(err);
							this.setStatus('error');
							this.setMessage('Cannot get currently associated records');
						});
				});
			})
			.catch(err => {
				this.setStatus('error');
				this.setMessage('Initialization error');
			});
	}

	/**
	 * Helpers
	 */

	getData(url) {
		try {
			// let data = getParam(url, 'data');
			// return JSON.parse(decodeURIComponent(data));
		} catch (err) {
			this.setStatus('error');
			this.setMessage('Error in parsing extra data. Is it passed in as an encoded string?')
		}
		return {
			schemaName: 'wa_wa_project_wa_book',
			displayField: 'wa_name'
		};
	}

	getId(url) {
		try {
			let data = getParam(url, 'id');
			return decodeURIComponent(data).replace(/{|}/g, '');
		} catch (err) {
			this.setStatus('error');
			this.setMessage('Error in parsing id. Is it passed in as query?')
		}
	}

	/**
	 * Render
	 */

  render() {
    return (
      <StyledApp className="app">
				<Records
					list={this.state.records}
					logicalName={Config.relatedEntName}
					primaryAttr={Config.relatedEntPrimaryIdAttr}
					displayField={Config.displayField}
					status={this.state.status}
					associated={this.state.associated}
					associate={this.associate}
					disassociate={this.disassociate}
				/>
				<Notification
					status={this.state.status}
					message={this.state.message} />
      </StyledApp>
    );
  }
}

export default App;
