import { createTogglInstance } from "../lib/TogglService"
import { Properties } from "../TimeTracker";

const togglServiceTest = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties() as unknown as Properties;

    const toggl = createTogglInstance(properties.TOGGL_API_KEY, properties);

    const projects = toggl.getProjectByProjectName("Receipt-data-input");

    Logger.log(projects);
}
