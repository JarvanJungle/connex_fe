import * as yup from "yup";

const raisePPRSchemaObject = {
    requisitionType: yup
        .string()
        .required("validation.requisitionType"),
    natureOfRequisition: yup
        .bool()
        .required("validation.natureOfRequisition"),
    selectProject: yup
        .object()
        .when(
            "natureOfRequisition", {
                is: false,
                then: yup.object(),
                otherwise: yup.object().required("validation.selectProject")
            }
        )
};

const initialSettings = {
    // currency: yup.lazy((value) => {
    //     switch (typeof value) {
    //     case "object":
    //         return yup.object().required("validation.currency");
    //     case "string":
    //         return yup.string().required("validation.currency");
    //     default:
    //         return yup.mixed("Something went wrong! Currency should be String or Object");
    //     }
    // })
    currency: yup.object().required("validation.currency")
};

const generalInformation = {
    PPRTitle: yup
        .string()
        .required("validation.PPRTitle"),
    procurementType: yup
        .string()
        .required("validation.procurementType"),
    approvalRoute: yup
        .object()
        .required("validation.approvalRoute")
};

const requestTerms = {
    deliveryAddress: yup
        .object()
        .required("validation.deliveryAddress"),
    deliveryDate: yup
        .string()
        .required("validation.deliveryDate")
};

const requestFormSchema = yup.object({
    ...raisePPRSchemaObject,
    ...initialSettings,
    ...generalInformation,
    ...requestTerms
});

export default requestFormSchema;
