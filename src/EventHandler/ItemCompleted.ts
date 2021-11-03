import { ITodoistService, TodoistTask } from "../lib/TodoistService";
import { ITogglService } from "../lib/TogglService";
import { ask, checkEventTaskTimeTrackingTaskWithSame, Properties, TodoistWebHookEvent } from "../TimeTracker";

const handleItemCompleted = (
    todoist: ITodoistService,
    toggl: ITogglService,
    event: TodoistWebHookEvent,
    scriptProperties: GoogleAppsScript.Properties.Properties,
    properties: Properties
) => {
    const isTrackingTask = checkEventTaskTimeTrackingTaskWithSame(
        event.event_data.id,
        properties.TRAKING_TASK_ID
    );

    if (!isTrackingTask) return ask({
        ok: false,
        message: "Not tracking task."
    });

    toggl.stopTimeEntry(properties.TIMEENTRY_ID);

    scriptProperties.setProperties({
        "TRAKING_TASK_ID": "empty",
        "TIMEENTRY_ID": ""
    });

    

    return deleteTimeTrackingLabelFromTask_(
        todoist,
        event,
        properties
    );

};

const deleteTimeTrackingLabelFromTask_ = (
    todoist: ITodoistService,
    event: TodoistWebHookEvent,
    properties: Properties
) => {
    const labels = event.event_data.labels
        .filter(label => label !== Number(properties.TIMETRACKING_LABEL_ID));

    const payload: TodoistTask = {
        label_ids: labels
    };

    todoist.updateTask(event.event_data.id, payload);

    return ask({ok: true});
}

export { handleItemCompleted };
