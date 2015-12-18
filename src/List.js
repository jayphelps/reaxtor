import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Component } from './Component';
import { SparseArray } from './SparseArray';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

export class List extends Component {
    constructor(opts) {
        super({ layout: new SparseArray(), ... opts });
    }
    initialize(changes) {
        return changes.combineLatest(this.initializeItems(changes));
    }
    initializeItems(changes) {
        return Observable.create((subscriber) => {

            const vdoms = [];
            const groups = [];
            const elements = [];
            const readyElements = [];
            const layout = this.layout;

            return changes.switchMap((change) => {

                const items = this.derefItems(change);
                const count = items.length;
                let waiting = 0;
                let updates = [];
                let itemIdx = -1;

                while (++itemIdx < count) {

                    const item = items[itemIdx];

                    if (!groups[itemIdx]) {
                        readyElements[itemIdx] = false;
                        groups[itemIdx] = new BehaviorSubject(item);
                        groups[itemIdx].key = itemIdx;
                        elements[itemIdx] = this.initializeItem(groups[itemIdx]);
                        updates[waiting++] = itemIdx;
                    } else if (!readyElements[itemIdx]) {
                        updates[waiting++] = itemIdx;
                    } else {
                        const elem = elements[itemIdx];
                        if (elem.shouldComponentUpdate(elem.key, elem.keySelector(item))) {
                            updates[waiting++] = itemIdx;
                            readyElements[itemIdx] = false;
                        }
                    }
                }

                vdoms.length = count;
                layout.setLength(count);
                elements.length = count;

                return Observable.defer(() => {

                    let updateIdx = -1;
                    while (++updateIdx < waiting) {
                        groups[updates[updateIdx]].next(items[updates[updateIdx]]);
                    }

                    const groupsLen = groups.length;
                    let groupsIndex = count - 1;

                    while(++groupsIndex < groupsLen) {
                        groups[groupsIndex].complete();
                    }

                    groups.length = count;

                    return Observable.combineLatest(
                            (updates.map(index => elements[index])),
                            (... elementVDoms) => elementVDoms.reduce((vdoms, vdom, index) => {
                                readyElements[updates[index]] = true;
                                vdoms[updates[index]] = vdom;
                                return vdoms;
                            }, vdoms)
                        )
                });
            }).subscribe(subscriber);
        });
    }
    initializeItem(models) {
        const index = models.key;
        const layout = this.layout;
        const ItemRenderer = this.itemRenderer();
        if (layout.getLength() <= index) {
            layout.insert(index);
            layout.setItemSize(index, 1);
        }
        return new ItemRenderer({ layout, models });
    }
    load(change) {
        const { model } = change;
        return model.getValue(['length']).mergeMap((length) => {
            let paths = [['length']];
            if (length > 0) {
                paths = paths.concat(this.suffixes(change, length));
            }
            return model.get(... paths.concat(this.extraPaths(change, length)));
        });
    }
    paths(change) {
        return [];
    }
    suffixes(change, length) {
        return [];
    }
    extraPaths(change, length) {
        return [];
    }
    itemRenderer() {
        return Component;
    }
    derefItems({ model, json }) {
        let index = -1;
        const count = json.length;
        const items = new Array(count);
        while (++index < count) {
            items[index] = this.derefItem({ model, index, json });
        }
        return items;
    }
    derefItem({ model, index, json }) {
        json = json[index];
        return {
            index, json,
            listModel: model,
            model: model.deref(json)
        };
    }
}
