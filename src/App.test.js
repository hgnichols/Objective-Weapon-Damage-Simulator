import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './css/index.css';
import './css/bootstrap.min.css';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
