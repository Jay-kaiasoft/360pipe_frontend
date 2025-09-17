import { getUserDetails } from "../../../utils/getUserDetails";

const PermissionWrapper = ({
    component,
    fallbackComponent = null,
    functionalityName,
    moduleName,
    actionId
}) => {
    const userData = getUserDetails() || [];

    // Allow Admins
    if (userData?.rolename === "Admin" || userData?.rolename === "Owner") {
        return <>{component}</>;
    }

    // Check permission
    const hasPermission = userData?.permissions?.functionalities?.some((item) =>
        item?.functionalityName?.toLowerCase() === functionalityName?.toLowerCase() &&
        item?.modules?.some((row) =>
            row?.moduleName?.toLowerCase() === moduleName?.toLowerCase() &&
            row?.roleAssignedActions?.includes(actionId)
        )
    );
    return hasPermission ? <>{component}</> : fallbackComponent;
};

export default PermissionWrapper;