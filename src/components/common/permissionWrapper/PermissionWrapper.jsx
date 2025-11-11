import { getUserDetails } from "../../../utils/getUserDetails";

const PermissionWrapper = ({
    component,
    fallbackComponent = null,
    functionalityName,
    moduleName,
    actionId,
    actionIds,
    checkAll = false // If true, require ALL actions; if false, require ANY action
}) => {
    const userData = getUserDetails() || [];

    // Allow Admins
    if (userData?.rolename === "SALES REPRESENTIVE" || userData?.subUser === false) {
        return <>{component}</>;
    }

    // Determine which actions to check
    const actionsToCheck = actionIds || (actionId ? [actionId] : []);

    // Check permission
    const hasPermission = userData?.permissions?.functionalities?.some((item) =>
        item?.functionalityName?.toLowerCase() === functionalityName?.toLowerCase() &&
        item?.modules?.some((row) =>
            row?.moduleName?.toLowerCase() === moduleName?.toLowerCase() &&
            (checkAll
                ? actionsToCheck.every(action => row?.roleAssignedActions?.includes(action))
                : actionsToCheck.some(action => row?.roleAssignedActions?.includes(action))
            )
        )
    );

    return hasPermission ? <>{component}</> : fallbackComponent;
};

export default PermissionWrapper;