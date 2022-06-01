import { useSelector } from "react-redux";
import { useMemo } from "react";
import { isNullOrUndefined } from "helper/utilities";

const useAuthenticated = () => {
    const authReducer = useSelector((state) => state.authReducer);
    return useMemo(() => !isNullOrUndefined(authReducer?.userDetails?.uuid), [authReducer]);
};

export default useAuthenticated;
