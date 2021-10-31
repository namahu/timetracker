const checkProperties = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties();

    Logger.log(properties);
};

const setProperty = () => {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty("key", "value");
};

