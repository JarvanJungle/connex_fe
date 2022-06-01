import * as Yup from "yup";
import i18next from "i18next";

const itemApprovedSchema = Yup.array()
    .of(
        Yup.object().shape({
            glAccountNumber: Yup.string()
                .required(i18next.t("PleaseSelectValidGLAccount"))
        })
    );

const itemCreatedSupplierSchema = Yup.array()
    .of(
        Yup.object().shape({
            invItemCode: Yup.string()
                .required(i18next.t("PleaseEnterValidItemCode")),
            itemDescription: Yup.string()
                .required(i18next.t("PleaseEnterValidDescription")),
            uomCode: Yup.string()
                .required(i18next.t("PleaseEnterValidUOM")),
            taxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            itemQuantity: Yup.number()
                .positive(i18next.t("ItemQuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemQuantityMustBeGreaterThanZero"),
                    (itemQuantity) => itemQuantity > 0
                ),
            unitPrice: Yup.number()
                .positive(i18next.t("ItemUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemUnitPriceMustBeGreaterThanZero"),
                    (unitPrice) => unitPrice > 0
                ),
            exchangeRate: Yup.number()
                .positive(i18next.t("ItemExchangeRateMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemExchangeRateMustBeGreaterThanZero"),
                    (exchangeRate) => exchangeRate > 0
                )
        })
    );

const itemCreatedBuyerSchema = Yup.array()
    .of(
        Yup.object().shape({
            invItemCode: Yup.string()
                .required(i18next.t("PleaseEnterValidItemCode")),
            itemDescription: Yup.string()
                .required(i18next.t("PleaseEnterValidDescription")),
            uomCode: Yup.string()
                .required(i18next.t("PleaseEnterValidUOM")),
            taxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            itemQuantity: Yup.number()
                .positive(i18next.t("ItemQuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemQuantityMustBeGreaterThanZero"),
                    (itemQuantity) => itemQuantity > 0
                ),
            unitPrice: Yup.number()
                .positive(i18next.t("ItemUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemUnitPriceMustBeGreaterThanZero"),
                    (unitPrice) => unitPrice > 0
                ),
            glAccountNumber: Yup.string()
                .required(i18next.t("PleaseSelectValidGLAccount")),
            exchangeRate: Yup.number()
                .positive(i18next.t("ItemExchangeRateMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("ItemExchangeRateMustBeGreaterThanZero"),
                    (exchangeRate) => exchangeRate > 0
                )
        })
    );

const validationSupplierSchema = Yup.object().shape({
    supplierCode: Yup.string()
        .required(i18next.t("PleaseSelectValidSupplier")),
    creditNoteDate: Yup.string()
        .required(i18next.t("PleaseSelectValidCreditNoteDate")),
    invoiceUuid: Yup.string()
        .test(
            "invoiceUuid",
            i18next.t("PleaseSelectValidReferenceInvoice"),
            (value, testContext) => {
                const { parent } = testContext;
                return ((value && parent.referenceToInvoice)
                    || (!value && !parent.referenceToInvoice)
                    || (value && !parent.referenceToInvoice)
                );
            }
        ),
    creditNoteNumber: Yup.string()
        .test(
            "doRequired",
            i18next.t("PleaseSelectValidCreditNoteNo"),
            (value, testContext) => {
                const { parent } = testContext;
                if (parent.enablePrefix && !value) {
                    return false;
                }
                return true;
            }
        )
});

const validationBuyerSchema = Yup.object().shape({
    supplierCode: Yup.string()
        .required(i18next.t("PleaseSelectValidSupplier")),
    creditNoteDate: Yup.string()
        .required(i18next.t("PleaseSelectValidCreditNoteDate")),
    creditNoteNumber: Yup.string()
        .test(
            "doRequired",
            i18next.t("PleaseSelectValidCreditNoteNo"),
            (value, testContext) => {
                const { parent } = testContext;
                if (parent.enablePrefix && !value) {
                    return false;
                }
                return true;
            }
        )
});

export {
    itemApprovedSchema,
    itemCreatedSupplierSchema,
    itemCreatedBuyerSchema,
    validationBuyerSchema,
    validationSupplierSchema
};
