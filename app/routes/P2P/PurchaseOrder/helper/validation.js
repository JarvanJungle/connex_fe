import * as Yup from "yup";
import i18next from "i18next";

const itemSchema = Yup.array()
    .of(
        Yup.object().shape({
            deliveryAddress: Yup.object()
                .required(i18next.t("ItemReqPleaseSelectValidAddress")),
            requestedDeliveryDate: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidRequestedDeliveryDate")),
            currency: Yup.string()
                .when("isPR", {
                    is: true,
                    then: Yup.string().required(i18next.t("ItemReqPleaseSelectValidSourceCurrency"))
                }),
            taxCode: Yup.string()
                .when("isPR", {
                    is: true,
                    then: Yup.string().required(i18next.t("ItemReqPleaseSelectValidTaxCode"))
                }),
            uomCode: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidUOM")),
            supplierUuid: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidSupplier")),
            itemUnitPrice: Yup.number()
                .transform((value) => (Number.isNaN(value) ? 0 : value))
                .test(
                    "positive-integer",
                    i18next.t("ItemUnitPriceMustBeNotNegative"),
                    (value, context) => value >= 0 || !context?.parent?.isPR
                ),
            exchangeRate: Yup.number()
                .positive(i18next.t("ExchangeRateMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ExchangeRateMustBeGreaterThanZero"),
                    (value, context) => value >= 0 || !context?.parent?.isPR
                ),
            quantity: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (value) => value > 0
                )
        })
    );

const formSchema = Yup.object().shape({
    poNumber: Yup.string()
        .test(
            "po-number",
            i18next.t("PleaseSelectValidPONo"),
            (value, testContext) => {
                const { parent } = testContext;
                if (parent.enablePrefix && !value) {
                    return false;
                }
                return true;
            }
        ),
    approvalRouteUuid: Yup.string()
        .test(
            "approvalRouteRequired",
            i18next.t("PleaseSelectValidApprovalRoute"),
            (value, testContext) => {
                const { parent } = testContext;
                if (!parent.approvalConfig) {
                    return true;
                }
                if (parent.isInsensitive && !value) {
                    return false;
                }
                return true;
            }
        )
});

export {
    itemSchema,
    formSchema
};
