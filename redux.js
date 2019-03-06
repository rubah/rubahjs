const lodash = require("lodash");
const redux = require("redux");

function main() {
    const rdx = {
        getReducer: function() {
            const cthis = this;
            return function(state = {}, action) {
                if (cthis.reducers[action.type]) {
                    return cthis.reducers[action.type](state, action);
                }
                return state;
            }
        },
        reducers: {
            set: (state, action) => { return action.data },
            apply: (state, action) => { return lodash.merge({}, state, action.data) }
        },
        addReducer: (key, reducer) => {
            this.reducers[key] = reducer;
            this.store.replaceReducer(this.getReducer());
        },
        resetState: function() {
            this.store.dispatch({ type: "set", data: {} })
        },
    };
    rdx.store = redux.createStore(rdx.getReducer(), {});
    rdx.store.redux = rdx;
    return rdx
}
module.exports = main;
