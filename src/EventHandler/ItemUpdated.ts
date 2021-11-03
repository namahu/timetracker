import { ITodoistService } from "../lib/TodoistService";
import { ITogglService, TimeEntryProps, TimeEntryResponse } from "../lib/TogglService";
import { ask, checkEventTaskTimeTrackingTaskWithSame, checkExistsTimetrackingLabelID, Properties, TodoistWebHookEvent } from "../TimeTracker";

const handleItemUpdated = (
    todoist: ITodoistService,
    toggl: ITogglService,
    event: TodoistWebHookEvent,
    properties: Properties,
    scriptProperties: GoogleAppsScript.Properties.Properties
) => {
    const hasTimetrackingLableID: boolean = checkExistsTimetrackingLabelID(
        event.event_data.labels, properties
    );

    const isTrackingTask: boolean = checkEventTaskTimeTrackingTaskWithSame(
        event.event_data.id,
        properties.TRAKING_TASK_ID
    );

    if (hasTimetrackingLableID && isTrackingTask)
        return ask({ ok: false });

    if (!hasTimetrackingLableID && !isTrackingTask) 
        return ask({
            ok: false,
            message: "Not tracking task."
        });

    if (!hasTimetrackingLableID && isTrackingTask)
        return stopTimeTracking_(
            toggl,
            properties,
            scriptProperties
        );

    return startTimeTracking_(
        todoist,
        toggl,
        event,
        properties,
        scriptProperties
    );
};

const startTimeTracking_ = (
    todoist: ITodoistService,
    toggl: ITogglService,
    event: TodoistWebHookEvent,
    properties: Properties,
    scriptProperties: GoogleAppsScript.Properties.Properties
) => {
    const projectID: number = event.event_data.project_id;
    const project = todoist.getProjectByProjectID(projectID);

    const todoistLabels = todoist.getLabelByLabelID(event.event_data.labels);
    const labelName: string[] = todoistLabels.length === 1
        ? []
        : todoistLabels.filter(label => {
            return label.id !== Number(properties.TIMETRACKING_LABEL_ID)
        }).map(label => label.name);

    const togglProject = toggl.getProjectByProjectName(project.name);
    console.log(togglProject);

    if (!togglProject.length) {
        // 計測始める前に、toggl側にプロジェクトを作成する
    }

    const payload: TimeEntryProps = {
        pid: togglProject[0].id,
        description: event.event_data.content,
        tags: labelName,
        created_with: properties.CREATED_WITH_PROP
    };

    const timeEntryResponse: TimeEntryResponse = toggl.startTimeEntry({
        time_entry: payload
    });
    scriptProperties.setProperties({
        "TRAKING_TASK_ID": event.event_data.id.toString(),
        "TIMEENTRY_ID": timeEntryResponse.data.id.toString()
    });

    return ask({ok: true});
};

const stopTimeTracking_ = (
    toggl: ITogglService,
    properties: Properties,
    scriptProperties: GoogleAppsScript.Properties.Properties
) => {
    toggl.stopTimeEntry(properties.TIMEENTRY_ID);
    scriptProperties.setProperties({
        "TRAKING_TASK_ID": "empty",
        "TIMEENTRY_ID": ""
    });

    return ask({ ok: true });
};

export { handleItemUpdated };
