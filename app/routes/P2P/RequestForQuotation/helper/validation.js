import * as Yup from "yup";
import i18next from "i18next";

const today = new Date();
today.setHours(0, 0, 0, 0);

const itemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemCode: Yup.string()
                .when("manualItem", {
                    is: true,
                    then: Yup.string().required(i18next.t("PleaseEnterValidItemCode"))
                }),
            itemName: Yup.string()
                .when("manualItem", {
                    is: true,
                    then: Yup.string().required(i18next.t("PleaseEnterValidItemName"))
                }),
            address: Yup.object()
                .required(i18next.t("ItemReqPleaseSelectValidAddress")),
            requestedDeliveryDate: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidRequestedDeliveryDate")),
            sourceCurrency: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidSourceCurrency")),
            uom: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidUOM")),
            itemQuantity: Yup.number().nullable()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (itemQuantity) => Number(itemQuantity) > 0
                )
        })
    ).min(1, i18next.t("AtLeastOneItemIsAdded"));

const rfqFormSchema = Yup.object().shape({
    requisitionType: Yup.string()
        .required(i18next.t("PleaseSelectValidTypeOfRequisition")),
    projectCode: Yup.string()
        .test(
            "project-required",
            i18next.t("PleaseSelectValidProject"),
            (value, testContext) => {
                const { parent } = testContext;
                return ((value && String(parent.project) === "true")
                    || (!value && String(parent.project) === "false")
                    || (value && String(parent.project) === "false")
                );
            }
        ),
    rfqTitle: Yup.string()
        .required(i18next.t("PleaseEnterValidRFQTitle")),
    procurementType: Yup.string()
        .required(i18next.t("PleaseSelectValidProcurementType")),
    deliveryAddress: Yup.string()
        .required(i18next.t("PleaseSelectValidDeliveryAddress")),
    deliveryDate: Yup.string()
        .required(i18next.t("PleaseSelectValidDeliveryDate"))
        .test(
            "date-validation",
            i18next.t("DeliveryDateCannotBeInThePast"),
            (value) => {
                const date = new Date(value);
                return date.getTime() - today.getTime() >= 0;
            }
        ),
    currencyCode: Yup.string()
        .required(i18next.t("PleaseSelectValidCurrency")),
    vendors: Yup.array()
        .min(1, i18next.t("PleaseSelectValidAVendor")),
    rfqType: Yup.string()
        .required(i18next.t("PleaseEnterValidRFQType")),
    validityStartDate: Yup.string().nullable()
        .when("rfqType", {
            is: (val) => val === "Contract",
            then: Yup.string().required(i18next.t("PleaseSelectValidValidityStartDate"))
                .test(
                    "date-validation",
                    i18next.t("ValidityStartDateCannotBeInThePast"),
                    (value) => {
                        const date = new Date(value);
                        return date.getTime() - today.getTime() >= 0;
                    }
                )
        }),
    validityEndDate: Yup.string().nullable()
        .when("rfqType", {
            is: (val) => val === "Contract",
            then: Yup.string().required(i18next.t("PleaseSelectValidValidityEndDate"))
                .test(
                    "date-validation",
                    i18next.t("ValidityEndDateCannotBeInThePast"),
                    (value) => {
                        const date = new Date(value);
                        return date.getTime() - today.getTime() >= 0;
                    }
                )
        }),
    dueDate: Yup.string().nullable()
        .required(i18next.t("PleaseSelectValidDueDate"))
        .test(
            "date-validation",
            i18next.t("DueDateCannotBeInThePast"),
            (value) => {
                const date = new Date(value);
                return date.getTime() - (new Date()).getTime() >= 0;
            }
        )
});

const quotationFormSchema = Yup.object().shape({
    currencyCode: Yup.string()
        .required(i18next.t("PleaseSelectValidCurrency")),
    taxCode: Yup.string()
        .required(i18next.t("PleaseSelectValidTaxCode"))

    // .when("rfqType", {
    //     is: (val) => val === "Contract",
    //     then: Yup.string().required(i18next.t("PleaseSelectValidTaxCode"))
    // })
});

const quotationUnconnectedSupplierFormSchema = Yup.object().shape({
    currencyCode: Yup.string()
        .required(i18next.t("PleaseSelectValidCurrency")),
    taxCode: Yup.string()
        .required(i18next.t("PleaseEnterValidTaxCode"))
        // .when("rfqType", {
        //     is: (val) => val === "Contract",
        //     then: Yup.string().required(i18next.t("PleaseEnterValidTaxCode"))
        // })
});

const quotationItemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            currencyCode: Yup.string()
                .required(i18next.t("PleaseSelectValidCurrency")),
            taxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            taxRate: Yup.number().nullable()
                .test(
                    "taxRate",
                    i18next.t("TaxPercentageMustBeGreaterThanZero"),
                    (taxRate) => Number(taxRate) >= 0
                )
        })
    );

const shortlistFormSchema = Yup.object().shape({
    approvalRouteUuid: Yup.string()
        .when("approvalConfig", {
            is: true,
            then: Yup.string().required(i18next.t("PleaseSelectValidApprovalRoute"))
        })
});

const reopenFormSchema = Yup.object().shape({
    dueDate: Yup.string().nullable()
        .required(i18next.t("PleaseSelectValidDueDate"))
        .test(
            "date-validation",
            i18next.t("DueDateCannotBeInThePast"),
            (value) => {
                const date = new Date(value);
                return date.getTime() - (new Date()).getTime() >= 0;
            }
        )
});

const shortlistSchema = Yup.array()
    .of(
        Yup.object().shape({
            awardedQty: Yup.number().nullable()
                .positive(i18next.t("AwardedQtyMustBeGreaterThanZero"))
                .test(
                    "awardedQty",
                    i18next.t("AwardedQtyMustBeGreaterThanZero"),
                    (awardedQty) => Number(awardedQty) > 0
                )
                .test(
                    "awardedQty",
                    i18next.t("AwardedQtyCannotBeGreaterThanRequestedQuantity"),
                    (awardedQty, testContext) => {
                        const { parent } = testContext;
                        return Number(awardedQty) <= parent.itemQuantity;
                    }
                )
        })
    );

export {
    itemsSchema,
    rfqFormSchema,
    quotationFormSchema,
    quotationUnconnectedSupplierFormSchema,
    quotationItemsSchema,
    shortlistFormSchema,
    shortlistSchema,
    reopenFormSchema
};
