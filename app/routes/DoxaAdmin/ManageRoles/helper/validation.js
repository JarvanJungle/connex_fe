import * as Yup from "yup";
import i18next from "i18next";

const roleSetupSchema = Yup.object().shape({
    role: Yup.string()
        .required(i18next.t("PleaseEnterValidRole"))
});

export default roleSetupSchema;
