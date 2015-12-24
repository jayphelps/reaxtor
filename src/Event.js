import { Subject } from 'rxjs/Subject';

export class Event extends Subject {
    lift(operator) {
        const event = new Event(this, this.destination || this);
        event.operator = operator;
        return event;
    }
    stop() {
        return this.do((x) => x.stopPropagation());
    }
    clobber() {
        return this.do((x) => {
            x.preventDefault();
            x.stopPropagation();
        });
    }
}
