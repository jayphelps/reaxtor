import React from 'react'
import Title from './Title';
import { connect } from 'reaxtor-redux';
import { ActionTypes as ReduxActionTypes } from 'redux/lib/createStore';

const Titles = ({ titles = [] }) => {
    return (
        <ul className='titles-list'>
        {titles.map((title, index) => (
            <li className='titles-list-item'
                key={title.$__key + '-v' + title.$__version}>
                <Title {...title}/>
            </li>
        ))}
        </ul>
    );
}

function TitlesFragment(falcor, { length = 0 } = []) {
    return falcor.get(...falcor.QL`{
        length, [0...${length}]: {
            name
        }
    }`);
}

export default connect(TitlesFragment)(Titles, (state, key, value) => {
    if (typeof value === 'object') {
        return Title.fragment;
    }
});
