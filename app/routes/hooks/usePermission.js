import { useSelector } from "react-redux";
import { useMemo } from "react";

/**
 * @param {string} featureCode
 * @return {{ read: Boolean, write: Boolean, approve: Boolean }}
 */
const usePermission = (featureCode) => {
    const permissionReducer = useSelector((state) => state.permissionReducer);
    return useMemo(
        () => {
            const combinedPermissions = [
                ...(permissionReducer?.userPermission?.ADMIN?.features || []),
                ...(permissionReducer?.userPermission?.USER?.features || [])
            ];
            const filteredPermissions = combinedPermissions
                .filter((f) => f.featureCode === featureCode)
                .map((f) => f.actions);
            return {
                read: filteredPermissions.some((p) => p?.read),
                write: filteredPermissions.some((p) => p?.write),
                approve: filteredPermissions.some((p) => p?.approve)
            };
        },
        [permissionReducer]
    );
};

export default usePermission;
