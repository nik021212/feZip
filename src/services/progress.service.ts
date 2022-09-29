import { Subject } from 'rxjs';

const subject = new Subject();

export const progressService = {
    sendProgressBar: (progressBar: number) => subject.next(progressBar),
    clearProgress: () => subject.next(),
    onProgressBar: () => subject.asObservable()
};
