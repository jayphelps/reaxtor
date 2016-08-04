import React from 'react'
import Titles from './Titles';
import { connect } from 'reaxtor-redux';
import { ActionTypes as ReduxActionTypes } from 'redux/lib/createStore';

const List = ({ name = '', ...props } = {}) => {
    return (
        <div className='genre-list'>
            <h4>{name}</h4>
            <Titles {...props}/>
        </div>
    );
}

function ListFragment(falcor, list) {
    return falcor.get(...falcor.QL`{
        name, titles: {
            length
        }
    }`);
}

export default connect(ListFragment)(List, {
    titles: Titles.fragment
});
