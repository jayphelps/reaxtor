export function rootReducer(state, action) {
    if (action.type === 'falcor') {
        return { ...action.data };
    }
    return state;
}
