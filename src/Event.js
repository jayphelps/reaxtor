import { Subject } from 'rxjs/Subject';

export class Event extends Subject {
    constructor() {
        super();
        this.onNext = (... args) => super.onNext(... args);
        this.onError = (... args) => super.onError(... args);
        this.onCompleted = (... args) => super.onCompleted(... args);
    }
}
