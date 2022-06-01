import { useState } from "react";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { filter, sortArrayByName } from "helper/utilities";

const useCustomState = (defaultValue) => {
    const showToast = useToast();
    const [state, setState] = useState(defaultValue);

    const getDataResponse = (responseData, type = "array") => {
        if (!responseData) return type === "array" ? [] : {};
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            if (!value) return type === "array" ? [] : {};
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            if (response) {
                showToast("error", response.data.message || response.data.error);
            }
            if (!response) {
                showToast("error", responseData?.reason?.message ?? "Error");
            }
        }
        return type === "array" ? [] : {};
    };

    const setNewState = (payload, options = null) => {
        if (!options) setState(payload);
        if (options?.isResponse) {
            let data = getDataResponse(payload, options.dataType ?? "array");
            if (options?.filter?.condition) {
                data = filter(data, options?.filter?.condition);
            }
            if (options?.sort?.key) {
                data = sortArrayByName(data, options?.sort?.key);
            }
            setState(data);
        }
    };

    return [state, setNewState];
};

export default useCustomState;
