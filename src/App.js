import React, { Component } from 'react';

import { getParam } from './Helper';

import logo from './logo.svg';
import './App.css';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			config: {},
			status: {
				ok: true,
				message: []
			}
		};
	}

	componentDidMount() {
	}

	parseConfig() {
		try {
			let data = getParam(window.location.search, 'data');
			let config = JSON.parse(decodeURIComponent(data));
			this.setState({ config });
		} catch (err) {
			this.setState({
				status: {
					ok: false,
					message: ['Error in parsing config. Is it passed in as an encoded string?']
				}
			});
		}
	}

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p>
          {
						this.state.status.ok ?
							JSON.stringify(this.state.config) :
							JSON.stringify(this.state.status.message)
					}
        </p>
      </div>
    );
  }
}

export default App;
