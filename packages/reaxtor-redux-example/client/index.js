import React from 'react';
import App from '../common/containers/App';
import { Scheduler } from 'rxjs';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Model } from 'reaxtor-falcor';
import DataSource from 'falcor-http-datasource';
import { configureStore } from '../common/store/configureStore';

import { connect } from 'react-redux';

const AppContainer = connect(
    (props) => props
)(App);

const store = configureStore(getRootModel());

render(
  <Provider store={store}>
    <AppContainer key='genre-app'/>
  </Provider>,
  document.getElementById('app')
)

function getRootModel() {
    return new Model({
        scheduler: Scheduler.asap,
        source: new DataSource('/model.json'),
        cache: window.__PRELOADED_STATE__ || {}
    });
}
