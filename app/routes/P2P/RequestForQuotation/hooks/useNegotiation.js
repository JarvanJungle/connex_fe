import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    convertToLocalTime,
    getCurrentCompanyUUIDByStore
} from "helper/utilities";
import RequestForQuotationService from "services/RequestForQuotationService";
import _ from "lodash";

const useNegotiation = (props) => {
    const { defaultValue } = props;
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const [negotiations, setNegotiations] = useState(defaultValue ?? []);
    const [companyUuid, setCompanyUuid] = useState("");
    const [rfqUuid, setRFQUuid] = useState("");
    const [supplierUuid, setSupplierUuid] = useState("");

    const setNewNegotiations = (rfqNegotiationList) => {
        const newNegotiations = [];
        newNegotiations.push(...rfqNegotiationList.map((negotiation) => ({
            ...negotiation,
            uploadedOn: convertToLocalTime(negotiation.uploadedOn)
        })));
        setNegotiations(newNegotiations);
    };

    const onSendNegotiation = async (comment, attachment, isBuyer) => {
        try {
            const date = new Date();
            const body = {
                guid: attachment?.guid ?? "",
                fileLabel: attachment?.fileLabel ?? "",
                comment,
                uploadedOn: convertToLocalTime(date, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                supplierUuid
            };
            if (!body.guid) delete body.guid;
            if (!body.fileLabel) delete body.fileLabel;
            if (!isBuyer) delete body.supplierUuid;

            let response = null;
            if (isBuyer) {
                response = await RequestForQuotationService.buyerSendNegotiation(
                    companyUuid, rfqUuid, body
                );
            }
            if (!isBuyer) {
                response = await RequestForQuotationService.supplierSendNegotiation(
                    companyUuid, rfqUuid, body
                );
            }
            if (response.data.status === "OK") {
                showToast("success", response.data.message);

                const newNegotiations = [...negotiations];
                newNegotiations.push({
                    guid: attachment?.guid ?? "",
                    fileLabel: attachment?.fileLabel ?? "",
                    comment,
                    uploadedOn: date,
                    uploadedBy: userDetails.name,
                    uploaderUuid: userDetails.uuid,
                    uploaderRole: userDetails.designation,
                    supplierUuid
                });
                setNegotiations(newNegotiations);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)) {
            const currentCompanyUuid = getCurrentCompanyUUIDByStore(
                permissionReducer
            );
            if (currentCompanyUuid) setCompanyUuid(currentCompanyUuid);
        }
    }, [permissionReducer]);

    return [
        supplierUuid,
        negotiations,
        {
            onSendNegotiation,
            setRFQUuid,
            setSupplierUuid,
            setNewNegotiations
        }
    ];
};

export default useNegotiation;
