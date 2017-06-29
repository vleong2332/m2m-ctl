import React, { Component } from 'react';
import styled from 'styled-components';

import Messages from './components/Messages';
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
	text-align: left;
	font-family: 'Segoe UI';
	font-size: 12px;
	color: #111;
`;

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			messages: [],
			records: [],
			associated: []
		};
		this.addMessage = this.addMessage.bind(this);
		this.removeMessage = this.removeMessage.bind(this);
		this.associate = this.associate.bind(this);
		this.disassociate = this.disassociate.bind(this);
	}

	addMessage(content, cb) {
		let messages = this.state.messages.slice(0,);
		messages.push(content);
		this.setState({ messages }, cb);
	}

	removeMessage(index, cb) {
		let messages = this.state.messages.slice(0,);
		messages.splice(index, 1);
		this.setState({ messages }, cb);
	}

	associate(recordId, cb) {
		associateInPort(recordId, Config)
			.then(resp => {
				let associated = this.state.associated.slice(0,);
				associated.push(recordId);
				this.setState({ associated }, cb);
			})
			.catch(error => {
				console.log('ASSOCIATE FAIL', error);
			});
	}

	disassociate(recordId, cb) {
		disassociateInPort(recordId, Config)
			.then(resp => {
				let associated = this.state.associated.filter(id => id !== recordId);
				this.setState({ associated }, cb);
			})
			.catch(error => {
				console.log('DISASSOCIATE FAIL', error);
			});
	}

	componentWillMount() {
		let data = this.getData(window.location.search);
		let thisEntName = getParam(window.location.search, 'typename');
		let thisEntId = this.getId(window.location.search);

		Config.init(this.props.xrm, data);
		Config.thisEntName = thisEntName;
		Config.thisEntId = thisEntId && thisEntId.replace(/{|}/g, '');
	}

	componentDidMount() {
		let { api, schemaName, displayField } = Config;
		getRelationshipMetadata(api, schemaName)
			.then(metadata => {
				if (!metadata) { return; }
				Config.configure(metadata);
				return getEntityMetadata(api, Config.thisEntName, [
					'LogicalCollectionName'
				]);
			})
			.then(metadata => {
				if (!metadata) { return; }
				Config.thisEntCollName = metadata.LogicalCollectionName;
				return getEntityMetadata(api, Config.relatedEntName, [
					'PrimaryIdAttribute',
					'LogicalCollectionName'
				]);
			})
			.then(metadata => {
				if (!metadata) { return; }
				Config.relatedEntPrimaryIdAttr = metadata.PrimaryIdAttribute;
				Config.relatedEntCollName = metadata.LogicalCollectionName;
				return getRelatedEntityRecords(api, Config.relatedEntCollName, [
					Config.relatedEntPrimaryIdAttr,
					displayField
				]);
			})
			.then(records => {
				if (!records) { return; }
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
							if (!records) { return; }
							let ids = records.map(record => record[Config.relatedEntPrimaryIdAttr]);
							this.setState({ associated: ids});

							console.log('CONFIG', Config);
						});
				});
			});
	}

	getData(url) {
		try {
			// let data = getParam(url, 'data');
			// return JSON.parse(decodeURIComponent(data));
		} catch (err) {
			this.addMessage('Error in parsing extra data. Is it passed in as an encoded string?')
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
			this.addMessage('Error in parsing id. Is it passed in as query?')
		}
	}

  render() {
    return (
      <StyledApp>
				<Messages messages={this.state.messages} />
				<Records
					list={this.state.records}
					logicalName={Config.relatedEntName}
					primaryAttr={Config.relatedEntPrimaryIdAttr}
					displayField={Config.displayField}
					associated={this.state.associated}
					associate={this.associate}
					disassociate={this.disassociate}
				/>
      </StyledApp>
    );
  }
}

export default App;
