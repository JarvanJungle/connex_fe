import * as Yup from "yup";
import i18next from "i18next";
import { CONTRACT_TYPES } from "helper/constantsDefined";

const itemSchema = Yup.array()
    .of(
        Yup.object().shape({
            address: Yup.object()
                .required(i18next.t("ItemReqPleaseSelectValidAddress")),
            requestedDeliveryDate: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidRequestedDeliveryDate")),
            sourceCurrency: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidSourceCurrency")),
            taxCode: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidTaxCode")),
            uom: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidUOM")),
            supplierUuid: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidSupplier")),
            itemUnitPrice: Yup.number()
                .transform((value) => (Number.isNaN(value) ? 0 : value))
                .test(
                    "positive-integer",
                    i18next.t("ItemUnitPriceMustBeNotNegative"),
                    (itemUnitPrice) => itemUnitPrice >= 0
                ),
            exchangeRate: Yup.number()
                .positive(i18next.t("ExchangeRateMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ExchangeRateMustBeGreaterThanZero"),
                    (exchangeRate) => exchangeRate > 0
                ),
            itemQuantity: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (itemQuantity) => itemQuantity > 0
                )
        })
    );

const prItemSchema = Yup.object().shape({
    requisitionType: Yup.string()
        .required(i18next.t("PleaseSelectValidTypeOfRequisition")),
    projectCode: Yup.string()
        .test(
            "projectRequired",
            i18next.t("PleaseSelectValidProject"),
            (value, testContext) => {
                const { parent } = testContext;
                return ((value && parent.project)
                    || (!value && !parent.project)
                    || (value && !parent.project)
                );
            }
        ),
    prTitle: Yup.string()
        .required(i18next.t("PleaseEnterValidPRTitle")),
    procurementType: Yup.string()
        .required(i18next.t("PleaseSelectValidProcurementType")),
    approvalRouteUuid: Yup.string()
        .when("approvalConfig", {
            is: true,
            then: Yup.string().required(i18next.t("PleaseSelectValidApprovalRoute"))
        }),
    deliveryAddress: Yup.string()
        .required(i18next.t("PleaseSelectValidDeliveryAddress")),
    deliveryDate: Yup.string()
        .required(i18next.t("PleaseSelectValidDeliveryDate")),
    currencyCode: Yup.string()
        .required(i18next.t("PleaseSelectValidCurrency")),
    prNumber: Yup.string()
        .test(
            "doRequired",
            i18next.t("PleaseSelectValidPurchaseRequestNo"),
            (value, testContext) => {
                const { parent } = testContext;
                if (parent.enablePrefix && !value) {
                    return false;
                }
                return true;
            }
        )
});

const dwrItemSchema = Yup.object().shape({
    requisitionType: Yup.string()
        .required(i18next.t("PleaseSelectValidTypeOfRequisition")),
    projectCode: Yup.string()
        .test(
            "projectRequired",
            i18next.t("PleaseSelectValidProject"),
            (value, testContext) => {
                const { parent } = testContext;
                return (
                    (value && parent.project)
                    || (!value && !parent.project)
                    || (value && !parent.project)
                );
            }
        ).nullable(true),
    currencyCode: Yup.string()
        .required(i18next.t("PleaseSelectValidCurrency")),
    contractType: Yup.string()
        .required(i18next.t("PleaseSelectValidContractType")),
    workRequisitionTitle: Yup.string()
        .required(i18next.t("PleaseEnterValidWorkRequisitionTitle")),
    retentionPercentage: Yup.string()
        .required(i18next.t("PleaseSelectValidRetentionPercentage")),
    retentionCappedPercentage: Yup.string()
        .required(i18next.t("PleaseSelectValidRetentionCappedPercentage")),
    vendorUuid: Yup.string()
        .required(i18next.t("PleaseSelectValidVendorCode")),
    dwrDate: Yup.string()
        .required(i18next.t("PleaseSelectValidWorkRequisitionDate")),
    tradeCode: Yup.string()
        .test(
            "tradeCodeRequired",
            i18next.t("PleaseSelectValidTradeCode"),
            (value, testContext) => {
                const { parent } = testContext;
                return (
                    (value && parent.project)
                    || (!value && !parent.project)
                    || (value && !parent.project));
            }
        ).nullable(true),
    bqContingencySum: Yup.string()
        .test(
            "bqContingencySumRequired",
            i18next.t("PleaseSelectValidBQContingencySum"),
            (value, testContext) => {
                const { parent } = testContext;
                return (
                    (value && parent.contractType === CONTRACT_TYPES.REMEASUREMENT)
                    || (!value && !(parent.contractType === CONTRACT_TYPES.REMEASUREMENT))
                    || (value && !(parent.contractType === CONTRACT_TYPES.REMEASUREMENT))
                );
            }
        ),
    approvalRouteUuid: Yup.string()
        .required(i18next.t("PleaseSelectValidApprovalRoute"))
});

export {
    itemSchema,
    prItemSchema,
    dwrItemSchema
};
