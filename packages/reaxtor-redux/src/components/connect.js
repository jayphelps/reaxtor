import React from 'react';
import {createFragment} from '../createFragment';
import {combineFragments} from '../combineFragments';

export function connect(fragment, actionResolver, childFragments, specifiedPath) {
    fragment = createFragment(fragment, actionResolver, specifiedPath);
    return function connectWithComponent(Component, resolveFragments) {
        return class Container extends React.Component {
            static displayName = `${Component.displayName || Component.name}Container`;
            static fragment = !resolveFragments ? fragment :
                combineFragments(fragment, resolveFragments);
            render() {
                return React.createElement(Component, this.props);
            }
        };
    }
}
