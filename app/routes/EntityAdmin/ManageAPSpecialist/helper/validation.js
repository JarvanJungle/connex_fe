import * as Yup from "yup";
import i18next from "i18next";

const apSpecialistGroupingSchema = Yup.object().shape({
    groupCode: Yup.string()
        .required(i18next.t("PleaseEnterValidGroupCode")),
    apSpecialistUsers: Yup.array()
        .test(
            "array-required",
            i18next.t("PleaseSelectValidUser"),
            (apSpecialistUsers) => apSpecialistUsers.length > 0
        ),
    vendorUuid: Yup.array()
        .test(
            "array-required",
            i18next.t("PleaseSelectValidVendor"),
            (vendorUuid) => vendorUuid.length > 0
        )
});

export default apSpecialistGroupingSchema;
