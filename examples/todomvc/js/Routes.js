import {
    ref as $ref,
    atom as $atom,
    pathValue as $pathValue,
    pathInvalidation as $pathInvalidation,
} from 'falcor-json-graph';

export function Routes() {

    const tasks = [];
    const table = {};
    let _taskId = -1;
    let input = '';
    tasks.filter = 'all';

    return [].concat(
        addAndRemoveTaskRoutes(),
        getAndSetTasksKeyRoutes(),
        getAndSetTaskKeysByIdRoutes()
    );

    function removeTaskByRef(taskRef) {
        const taskId = taskRef[taskRef.length - 1];
        const taskIndex = tasks.indexOf(taskRef);
        delete table[taskId];
        tasks.splice(taskIndex, 1);
        return $pathInvalidation(`tasksById['${taskId}']`);
    }

    function removeTaskById(taskId) {
        const task = table[taskId];
        delete table[taskId];
        const taskIndex = tasks.indexOf(task.ref);
        if (~taskIndex) {
            tasks.splice(taskIndex, 1);
        }
        return $pathInvalidation(`tasksById['${taskId}']`);
    }

    function addAndRemoveTaskRoutes() {
        return [{
            route: `input.add`,
            call(callPath, [content]) {

                const taskId = ++_taskId;
                const taskRef = ['tasksById', taskId];
                const taskIndex = tasks.push(taskRef) - 1;
                table[taskId] = {
                    ref: taskRef,
                    completed: false,
                    id: taskId, content
                };

                return [
                    $pathValue(`tasks.length`, tasks.length),
                    $pathValue(`tasks['${taskIndex}']`, $ref(taskRef.slice(0)))
                ];
            }
        }, {
            route: `tasks.completed.remove`,
            call() {

                const values = Array.prototype.filter.call(tasks, (taskRef) => {
                    const taskId = taskRef[taskRef.length - 1];
                    const {completed} = table[taskId];
                    return completed === true;
                }).map(removeTaskByRef);

                return values.length <= 0 ? values : [
                    $pathInvalidation(`tasks`)
                ].concat(values);
            }
        }, {
            route: `tasksById[{keys:taskIds}].remove`,
            call({ taskIds }) {

                const values = taskIds.map(removeTaskById);

                return values.length <= 0 ? values : [
                    $pathInvalidation(`tasks`)
                ].concat(values);
            }
        }]
    };

    function getAndSetTasksKeyRoutes() {
        return [{
            route: `input.value`,
            get() {
                return [$pathValue(`input.value`, $atom(input))]
            },
            set(jsonGraph) {
                return [$pathValue(`input.value`, $atom(input = jsonGraph.input.value))]
            }
        }, {
            route: `tasks[{keys:props}]`,
            get({ props }) {
                return props.map((prop) => {
                    let value = tasks[prop];
                    const path = `tasks['${prop}']`;
                    if (Array.isArray(value)) {
                        value = $ref(value.slice(0));
                    }
                    return $pathValue(path, value);
                });
            },
            set(jsonGraph) {
                const setTasks = jsonGraph.tasks;
                const tasksProps = Object.keys(setTasks);
                return tasksProps.map((prop) => {
                    let value = setTasks[prop];
                    const path = `tasks['${prop}']`;
                    if (Array.isArray(value)) {
                        value = $ref(tasks[prop] = value.slice(0));
                    } else {
                        tasks[prop] = value;
                    }
                    return $pathValue(path, value);
                });
            }
        }];
    }

    function getAndSetTaskKeysByIdRoutes() {
        return [{
            route: `tasksById[{keys:ids}][{keys:props}]`,
            get({ ids, props }) {
                return ids.reduce((values, id) => {
                    const task = table[id];
                    return values.concat(props.reduce((values, prop) => {
                        return values.concat($pathValue(
                            `tasksById['${id}']['${prop}']`, $atom(task[prop])
                        ));
                    }, []));
                }, []);
            },
            set({ tasksById }) {
                const ids = Object.keys(tasksById);
                return ids.reduce((values, taskId) => {
                    const task = tasksById[taskId];
                    const props = Object.keys(task);
                    return values.concat(props.reduce((values, key) => {
                        return values.concat($pathValue(
                            `tasksById['${taskId}']['${key}']`,
                            $atom(table[taskId][key] = task[key])
                        ));
                    }, []));
                }, []);
            }
        }, {
            route: `tasksById[{keys:ids}].toggle`,
            call({ ids }, [bool]) {

                const values = ids.map((taskId) => {
                    return $pathValue(
                        `tasksById['${taskId}'].completed`,
                        table[taskId].completed = bool
                    );
                });

                return values.length <= 0 ? values : [
                    $pathInvalidation(`tasks.filter`)
                ].concat(values);
            }
        }];
    }
}

/*

    function tasksView() {
        return {
            route: `tasks.where[{keys:filters}][{keys:props}]`,
            get({ filters, props }) {

                const exprs = filters.map((filter) => {
                    const expr = filter.split('=');
                    const lhs = (expr[0] || '');
                    const rhs = (expr[1] || '');
                    return { lhs, rhs };
                });

                return exprs.reduce((values, expr, index) => {

                    const pred = filters[index];
                    const tasks2 = tasks.filter((taskRef) => {
                        const taskId = taskRef[taskRef.length - 1];
                        const task = table[taskId];
                        const { lhs, rhs } = expr;
                        return (lhs === '') ? true : (
                            String(task[lhs]) === rhs);
                    });

                    return values.concat(props.reduce((values, prop) => {
                        const val = tasks2[prop];
                        const path = `tasks.where['${pred}']['${prop}']`;
                        if (prop === 'length') {
                            return values.concat($pathValue(path, $atom(val)));
                        }
                        return values.concat($pathValue(path, $ref(val.slice(0))));
                    }, []));
                }, []);
            },
            call({ filters }) {

                const exprs = filters.map((filter) => {
                    const expr = filter.split('=');
                    const lhs = (expr[0] || '');
                    const rhs = (expr[1] || '');
                    return { lhs, rhs };
                });

                const values = exprs.reduce((values, expr, index) => {

                    const pred = filters[index];
                    const tasks2 = tasks.filter((taskRef) => {
                        const taskId = taskRef[taskRef.length - 1];
                        const task = table[taskId];
                        const { lhs, rhs } = expr;
                        return (lhs === '') ? true : (
                            String(task[lhs]) === rhs);
                    });

                    return values.concat(tasks2.reduce((values, taskRef) => {
                        const taskId = taskRef[taskRef.length - 1];
                        const taskIndex = tasks.indexOf(taskRef);
                        delete table[taskId];
                        tasks.splice(taskIndex, 1);
                        return values.concat($pathInvalidation(`tasksById['${taskId}']`));
                    }, []));
                }, []);

                if (values.length > 0) {
                    return [
                        $pathInvalidation(`tasks`),
                        $pathInvalidation(`tasks.where`),
                        $pathValue(`tasks.where['completed=true'].length`, $atom(0)),
                        $pathValue(`tasks.where['completed=false'].length`, $atom(tasks.length)),
                    ].concat(values);
                }

                return values;
            }
        }
    }
*/
