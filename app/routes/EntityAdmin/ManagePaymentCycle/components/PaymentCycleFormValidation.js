import * as Yup from "yup";
import i18next from "i18next";

const PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA = Yup.object().shape({
    paymentCycleCode: Yup.string().required(i18next.t("PleaseInputValidPaymentCycleCode")),
    paymentCycleDate: Yup.number().required(i18next.t("PleaseSelectValidPaymentCycleDate"))
});

export default PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA;
