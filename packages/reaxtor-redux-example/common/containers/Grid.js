import React from 'react'
import List from './List';
import { connect } from 'reaxtor-redux';
import { ActionTypes as ReduxActionTypes } from 'redux/lib/createStore';

const Grid = ({ genrelist = [] }) => {
    const { myList } = genrelist;
    return (
        <div className='genre-grid'>

            {myList ? (
                <List key={myList.$__key + '-v' + myList.$__version} { ...myList }/>
            ) : null}

            {genrelist.filter((list) => (
                !myList || list.$__key !== myList.$__key
            )).map((list, index) => (
                <List key={list.$__key + '-v' + list.$__version} { ...list }/>
            ))}

        </div>
    );
}

function GridFragment(falcor, { length = 0 } = {}) {
    return falcor.get(...falcor.QL`{
        length,
        myList: {
            name
        },
        [0...${length}]: {
            name
        }
    }`);
}

export default connect(GridFragment)(Grid, (state, key, value) => {
    if (typeof value === 'object') {
        return List.fragment;
    }
});
