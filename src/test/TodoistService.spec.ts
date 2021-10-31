import { createTodoistInstance } from "../lib/TodoistService";
import { Properties } from "../TimeTracker";

const todoistServiceTest = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties() as unknown as Properties;
    const todoist = createTodoistInstance(properties.TODOIST_API_KEY);

    const project = todoist.getProjectByProjectID(properties.TODOIST_TEST_PROJECT_ID);

    Logger.log(project);
};
