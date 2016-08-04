import App from '../containers/App';
// import createLogger from 'redux-logger';
import { rootReducer } from '../reducers';
import { createStore, applyMiddleware } from 'redux';
import { createFragmentMiddleware } from 'reaxtor-redux';

export function configureStore(rootModel) {
    const store = createStore(
        rootReducer, {},
        applyMiddleware(createFragmentMiddleware(
            rootModel, App.fragment
        ))
    );
    return store;
}
