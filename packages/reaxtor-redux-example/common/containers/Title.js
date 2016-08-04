import React from 'react'
import { connect } from 'reaxtor-redux';
import { ActionTypes as ReduxActionTypes } from 'redux/lib/createStore';

const Title = ({ name, year, rating, boxshot, description, userRating }) => {
    return (
        <div
            title={name}
            className='title'
            style={{
                backgroundImage: `url(${boxshot})`
            }}>
        </div>
    );
}

function TitleFragment(falcor, title) {
    return falcor.get(...falcor.QL`{
        name, year, rating, boxshot,
        description, userRating
    }`);
}

export default connect(TitleFragment)(Title);
