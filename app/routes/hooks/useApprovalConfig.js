import { useEffect, useState, useMemo } from "react";
import ApprovalConfigService from "services/ApprovalConfigService";
import { useSelector } from "react-redux";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import useToast from "./useToast";

const useApprovalConfig = (featureCode) => {
    const showToast = useToast();
    const [approvalConfig, setApprovalConfig] = useState(false);
    const permissionReducer = useSelector((state) => state.permissionReducer);

    const getApprovalConfig = (currentCompanyUUID) => {
        try {
            ApprovalConfigService.checkApprovalConfigByFeature(
                currentCompanyUUID, featureCode
            ).then((response) => {
                const { data, status, message } = response && response.data;
                if (status === RESPONSE_STATUS.OK) {
                    setApprovalConfig(data ?? false);
                } else {
                    showToast("error", `Approval Config: ${message}`);
                }
            });
        } catch (error) {
            showToast("error", `Approval Config: ${error.response ? error.response.data.message : error.message}`);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID) {
            getApprovalConfig(currentCompanyUUID);
        }
    }, [permissionReducer]);

    return useMemo(() => approvalConfig, [approvalConfig]);
};

export default useApprovalConfig;
