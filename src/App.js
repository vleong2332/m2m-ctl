import React, { Component } from 'react';

import Messages from './components/Messages';
import Records from './components/Records';

import Config from './modules/Config';
import Ajax from './modules/Ajax';
import { getParam } from './modules/Helper';

import './App.css';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			messages: [],
			records: []
		};
		this.addMessage = this.addMessage.bind(this);
		this.removeMessage = this.removeMessage.bind(this);
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

	componentWillMount() {
		let data = this.getData(window.location.search);

		Config.init(data);
		Config.thisEntName = getParam(window.location.search, 'typename');
		console.log('CONFIG', Config);
	}

	componentDidMount() {
		this.getRelationshipMetadata(Config.api, Config.schemaName)
			.then(metadata => {
				if (!metadata) { return; }

				Config.configure(metadata);

				return this.getEntityMetadata(Config.api, Config.relatedEntName, [
					'PrimaryIdAttribute',
					'LogicalCollectionName'
				]);
			})
			.then(metadata => {
				if (!metadata) { return; }

				Config.relatedEntPrimaryIdAttr = metadata.PrimaryIdAttribute;
				Config.relatedEntCollName = metadata.LogicalCollectionName;

				return this.getRelatedEntityRecords(Config.api, Config.relatedEntCollName, [
					Config.relatedEntPrimaryIdAttr,
					Config.displayField
				]);
			})
			.then(records => {
				console.log('RECORDS', records);
				Config.records = records;
				this.setState({ records });
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

	getRelationshipMetadata(api, schemaName) {
		return Ajax.sendWithPromise(`${api}/RelationshipDefinitions?` +
			`$filter=SchemaName eq '${schemaName}'`
		)
			.then(resp => resp && JSON.parse(resp).value[0])
			.catch(console.error);
	}

	getEntityMetadata(api, entityName, select) {
		return Ajax.sendWithPromise(`${api}/EntityDefinitions?` +
			`$select=${select.join(',')}&` +
			`$filter=LogicalName eq '${entityName}'`
		)
			.then(resp => resp && JSON.parse(resp).value[0])
			.catch(console.error);
	}

	getRelatedEntityRecords(api, collectionName, select) {
		return Ajax.sendWithPromise(`${api}/${collectionName}?` +
			`$select=${select.join(',')}&` +
			`$filter=statecode eq 0`
		)
			.then(resp => resp && JSON.parse(resp).value)
			.catch(console.error);
	}

  render() {
    return (
      <div className="App">
				<Messages messages={this.state.messages} />
				<Records
					list={this.state.records}
					logicalName={Config.relatedEntName}
					primaryAttr={Config.relatedEntPrimaryIdAttr}
					displayField={Config.displayField}
				/>
      </div>
    );
  }
}

export default App;
