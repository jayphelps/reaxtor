import React from 'react'
import Grid from './Grid';
import { connect } from 'reaxtor-redux';
import { ActionTypes as ReduxActionTypes } from 'redux/lib/createStore';

const App = (props) => {
    return (
        <div className='genre-app'>
            <Grid key='genre-grid' {...props} />
        </div>
    );
}

function AppFragment(falcor, state) {
    return falcor.get(...falcor.QL`{
        genrelist: {
            length
        }
    }`);
}


export default connect(AppFragment)(App, {
    genrelist: Grid.fragment
});
