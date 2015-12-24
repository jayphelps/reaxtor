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
    tasks.view = ['tasks'];

    return [
        addTask(),
        tasksKeys(),
        tasksView(),
        tasksById()
    ];

    function addTask() { return {
        route: `tasks.add`,
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
                $pathInvalidation(`tasks.where`),
                $pathValue(`tasks.length`, tasks.length),
                $pathValue(`tasks['${taskIndex}']`, $ref(taskRef))
            ];
        }
    }}

    function tasksKeys() { return {
        route: `tasks[{keys:props}]`,
        get({ props }) {
            return props.reduce((values, prop) => {
                const path = `tasks['${prop}']`;
                if (prop === 'length') {
                    return values.concat($pathValue(path, $atom(tasks[prop])));
                }
                return values.concat($pathValue(path, $ref(tasks[prop])));
            }, []);
        }
    }}

    function tasksView() { return {
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
                    return values.concat($pathValue(path, $ref(val)));
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
                    $pathInvalidation(`tasks.where`)
                ].concat(values);
            }

            return values;
        }
    }}

    function tasksById() { return {
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
        },
        call({ ids, props }, args) {
            const methodName = props[0];
            const values = ids.reduce((values, taskId) => {
                const task = table[taskId];
                if (methodName === 'remove') {
                    delete table[taskId];
                    const taskIndex = tasks.indexOf(task.ref);
                    if (~taskIndex) {
                        tasks.splice(taskIndex, 1);
                    }
                    return values.concat(
                        $pathInvalidation(`tasksById['${taskId}']`)
                    );
                } else if (methodName === 'toggle') {
                    return values.concat(
                        $pathValue(`tasksById['${taskId}'].completed`, task.completed = args[0])
                    );
                }
            }, []);

            if (methodName === 'remove' && values.length > 0) {
                return [
                    $pathInvalidation(`tasks`)
                ].concat(values);
            }

            return values;
        }
    }}
}
