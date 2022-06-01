import { useSelector } from "react-redux";

const useCurrentCompany = () => {
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { currentCompany = {} } = permissionReducer;
    return currentCompany;
};

export default useCurrentCompany;
