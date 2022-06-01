import * as Yup from "yup";
import i18next from "i18next";
import { PAYMENT_BATCH_CONSTANTS } from "./constant";

const today = new Date();
today.setHours(0, 0, 0, 0);

const paymentBatchValidationSchema = Yup.object().shape({
    referenceNumber: Yup.string()
        .required(i18next.t("PleaseEnterValidReferenceNo")),
    paymentMethod: Yup.string()
        .required(i18next.t("PleaseSelectValidPaymentMethod")),
    paymentReleaseDate: Yup.string()
        .when("paymentMethod", (paymentMethod, schema) => {
            if (paymentMethod !== PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION) {
                return schema.required(i18next.t("PleaseEnterValidPaymentReleaseDate"));
            }
            return schema;
        }),
    chequeNumber: Yup.string()
        .when("paymentMethod", (paymentMethod, schema) => {
            if (paymentMethod === PAYMENT_BATCH_CONSTANTS.CHEQUE) {
                return schema.required(i18next.t("PleaseEnterValidChequeNumber"));
            }
            return schema;
        }),
    sourceBankAccount: Yup.string()
        .when("paymentMethod", (paymentMethod, schema) => {
            if (paymentMethod === PAYMENT_BATCH_CONSTANTS.MANUAL
                || paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
            ) {
                return schema.required(i18next.t("PleaseSelectValidBankAccount"));
            }
            return schema;
        }),
    productType: Yup.string()
        .when("paymentMethod", (paymentMethod, schema) => {
            if (paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
            ) {
                return schema.required(i18next.t("PleaseSelectValidBankIntegrationProduct"));
            }
            return schema;
        }),
    chargeBearer: Yup.string()
        .when("productType", (productType, schema) => {
            if (productType === "TT"
            ) {
                return schema.required(i18next.t("PleaseSelectValidChargeBearer"));
            }
            return schema;
        }),
    executionDate: Yup.string()
        .when("paymentMethod", (paymentMethod, schema) => {
            if (paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION) {
                return schema.required(i18next.t("PleaseEnterValidExecutionDate"));
            }
            return schema;
        })
        .test(
            "date-validation",
            i18next.t("ExecutionDateCannotBeInThePast"),
            (value, testContext) => {
                const { parent } = testContext;
                const date = new Date(value);
                return (parent.paymentMethod !== PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION)
                    || (!Number.isNaN(date.getTime())
                        && (new Date(value)).getTime() - today.getTime() >= 0
                        && parent.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION);
            }
        )
});

const paymentItemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            receiveBankAccount: Yup.object().shape({
                uuid: Yup.string()
                    .required(i18next.t("PleaseSelectValidBankAccountForPaymentItem")),
                bankName: Yup.string()
                    .required(i18next.t("PleaseSelectValidBankAccountForPaymentItem")),
                bankAccountNo: Yup.number()
                    .required(i18next.t("PleaseSelectValidBankAccountForPaymentItem")),
                accountHolder: Yup.string()
                    .required(i18next.t("PleaseSelectValidBankAccountForPaymentItem"))
            })
        })
    );

export {
    paymentBatchValidationSchema,
    paymentItemsSchema
};
