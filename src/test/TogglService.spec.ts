import { createTogglInstance, TimeEntry, TimeEntryProps } from "../lib/TogglService"
import { Properties } from "../TimeTracker";

const togglProjectTest = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties() as unknown as Properties;

    const toggl = createTogglInstance(properties.TOGGL_API_KEY, properties);

    const projects = toggl.getProjectByProjectName("Receipt-data-input");

    Logger.log(projects);
};

const timeEntryTest = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties() as unknown as Properties;

    const toggl = createTogglInstance(properties.TOGGL_API_KEY, properties);

    const payload: TimeEntryProps = {
        pid: 1,
        description: "test",
        tags: [],
        created_with: "namahu/TimeTracker"
    };

    const res = toggl.startTimeEntry({time_entry: payload});
    Logger.log(res);
}
