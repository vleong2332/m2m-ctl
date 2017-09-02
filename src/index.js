import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';

ReactDOM.render(<App xrm={window.parent.Xrm} />, document.getElementById('root'));
