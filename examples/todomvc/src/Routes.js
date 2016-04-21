import _filter from 'lodash.filter';
import { Model } from './../../../';
import { Observable } from 'rxjs/Observable';
import {
    ref as $ref,
    atom as $atom,
    pathValue as $pathValue,
    pathInvalidation as $pathInvalidation,
} from 'falcor-json-graph';

export function Routes(cache = {
    apiVersion: 0,
    globalTaskId: 0,
    input: { value: '' },
    tasks: { length: 0 , filter: 'all' }
}) {

    const model = new Model({
        cache, //boxed: true,
        materialized: true,
        treatErrorsAsValues: true
    });

    return [].concat(
        apiVersionRoute(),
        globalTaskIdRoute(),
        removeTaskByIdRoute(),
        addTaskFromInputRoute(),
        getAndSetTasksKeyRoutes(),
        removeCompletedTasksRoute(),
        getAndSetTaskKeysByIdRoutes()
    );

    function apiVersionRoute() {
        return {
            route: `apiVersion`,
            get(pathSet) {
                return model.get(pathSet)._toJSONG();
            }
        }
    }

    function globalTaskIdRoute() {
        return {
            route: `globalTaskId`,
            get(pathSet) {
                return model.get(pathSet)._toJSONG();
            }
        }
    }

    function getAndSetTasksKeyRoutes() {
        return [{
            route: `input.value`,
            get(pathSet) {
                return model.get(pathSet)._toJSONG();
            },
            set(json) {
                return model.set({ json })._toJSONG();
            }
        }, {
            route: `tasks[{keys:props}]`,
            get(pathSet) {
                return model.get(pathSet)._toJSONG();
            },
            set(json) {
                return model.set({ json })._toJSONG();
            }
        }];
    }

    function getAndSetTaskKeysByIdRoutes() {
        return [{
            route: `tasksById[{keys:ids}][{keys:props}]`,
            get(pathSet) {
                return model.get(pathSet)._toJSONG();
            },
            set(json) {
                return model.set({ json })._toJSONG();
            }
        }, {
            route: `tasksById[{keys:ids}].toggle`,
            call({ ids }, [bool]) {

                if (ids.length === 0) {
                    return [];
                }

                return model.getValue(`tasks.filter`)
                    .flatMap((filter) => model.set(
                        $pathValue(['tasksById', ids, 'completed'], bool))
                        ._toJSONG()
                        .map(({ paths, jsonGraph }) => {
                            paths.push(['tasks', 'filter']);
                            jsonGraph.tasks = { filter };
                            return { paths, jsonGraph };
                        })
                    )
            }
        }];
    }

    function addTaskFromInputRoute() {
        return {
            route: `input.add`,
            call(callPath, [content]) {
                return model
                    .get(`globalTaskId`, `tasks.length`)
                    .flatMap(({ json: { globalTaskId, tasks: { length }}}) => {
                        // debugger;
                        const taskId = globalTaskId + 1;
                        const taskRef = `tasksById['${taskId}']`;
                        const taskIndex = length;
                        return model.set({ json: {
                            globalTaskId: taskId,
                            input: { value: '' },
                            tasks: {
                                length: length + 1,
                                [taskIndex]: $ref(taskRef)
                            },
                            tasksById: {
                                [taskId]: {
                                    content,
                                    id: taskId,
                                    completed: false
                                }
                            }
                        }})._toJSONG();
                    });
            }
        };
    }

    function removeTaskByIdRoute() {
        return {
            route: `tasksById[{keys:taskIds}].remove`,
            call({ taskIds }) {
                taskIds = taskIds.map(String);
                return model
                    .getValue(`tasks.length`)
                    .mergeMap((length) => (length === 0) ?
                        Observable.empty() : model.get(
                            `tasks.length`,
                            `tasks[0...${length}]['id']`
                        )
                    )
                    .flatMap(({ json: { tasks }}) => {

                        let taskIndex = -1;
                        const taskLen = tasks.length;
                        const invalidated = [];
                        const newTaskRefs = [];

                        while (++taskIndex < taskLen) {
                            const {id} = tasks[taskIndex];
                            if (~taskIds.indexOf(String(id))) {
                                invalidated.push($pathInvalidation(`tasksById['${id}']`));
                            } else {
                                newTaskRefs.push($pathValue(
                                    `tasks[${newTaskRefs.length}]`,
                                    $ref(`tasksById['${id}']`)
                                ));
                            }
                            invalidated.push($pathInvalidation(`tasks['${taskIndex}']`));
                        }

                        newTaskRefs.push($pathValue(`tasks.length`, newTaskRefs.length));

                        if (invalidated.length > 0) {
                            model.invalidate(...invalidated.map(({path}) => path));
                        }

                        return Observable
                            .from(invalidated)
                            .concat(model.set(...newTaskRefs)._toJSONG());
                    });
            }
        };
    }

    function removeCompletedTasksRoute() {
        return {
            route: `tasks.completed.remove`,
            call() {
                return model
                    .getValue(`tasks.length`)
                    .mergeMap((length) => (length === 0) ?
                        Observable.empty() : model.get(
                            `tasks.length`,
                            `tasks[0...${length}]['id', 'completed']`
                        )
                    )
                    .flatMap(({ json: { tasks }}) => {

                        let taskIndex = -1;
                        const taskLen = tasks.length;
                        const invalidated = [];
                        const newTaskRefs = [];

                        while (++taskIndex < taskLen) {
                            const {id, completed} = tasks[taskIndex];
                            if (completed) {
                                invalidated.push($pathInvalidation(`tasksById['${id}']`));
                            } else {
                                newTaskRefs.push($pathValue(
                                    `tasks[${newTaskRefs.length}]`,
                                    $ref(`tasksById['${id}']`)
                                ));
                            }
                            invalidated.push($pathInvalidation(`tasks['${taskIndex}']`));
                        }

                        newTaskRefs.push($pathValue(`tasks.length`, newTaskRefs.length));

                        if (invalidated.length > 0) {
                            model.invalidate(...invalidated.map(({path}) => path));
                        }

                        return Observable
                            .from(invalidated)
                            .concat(model.set(...newTaskRefs)._toJSONG());
                    });
            }
        };
    }
}
