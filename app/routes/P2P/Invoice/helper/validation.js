import * as Yup from "yup";
import i18next from "i18next";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";

// one item
const oneManualItemSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemName: Yup.string()
                .required(i18next.t("PleaseEnterValidItemName")),
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceQty: Yup.number()
                .positive(i18next.t("InvoiceQuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceQuantityMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                ),
            invoiceUnitPrice: Yup.number()
                .positive(i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
        })
    );

// many items
const manyManualItemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemName: Yup.string()
                .required(i18next.t("PleaseEnterValidItemName")),
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceUnitPrice: Yup.number()
                .positive(i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
        })
    );

// one item
const oneSelectedItemSchema = Yup.array()
    .of(
        Yup.object().shape({
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceQty: Yup.number()
                .positive(i18next.t("InvoiceQuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceQuantityMustBeGreaterThanZero"),
                    (invoiceQty) => invoiceQty > 0
                ),
            invoiceUnitPrice: Yup.number()
                .test(
                    "invoiceUnitPrice",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (invoiceUnitPrice, testContent) => {
                        if (isNullOrUndefinedOrEmpty(testContent.parent.priceType)
                            && invoiceUnitPrice <= 0) {
                            return false;
                        }
                        return true;
                    }
                )
        })
    );

// may items
const manySelectedItemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceUnitPrice: Yup.number()
                .test(
                    "invoiceUnitPrice",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (invoiceUnitPrice, testContent) => {
                        if (isNullOrUndefinedOrEmpty(testContent.parent.priceType)
                            && invoiceUnitPrice < 0) {
                            return false;
                        }
                        return true;
                    }
                )
        })
    );

// one item
const oneNonPOItemSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemName: Yup.string()
                .required(i18next.t("PleaseEnterValidItemName")),
            itemCode: Yup.string()
                .required(i18next.t("PleaseEnterValidItemCode")),
            uom: Yup.string()
                .required(i18next.t("PleaseEnterValidUOM")),
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceQty: Yup.number()
                .positive(i18next.t("InvoiceQuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceQuantityMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                ),
            invoiceUnitPrice: Yup.number()
                .positive(i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
        })
    );

// many item
const manyNonPOItemsSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemName: Yup.string()
                .required(i18next.t("PleaseEnterValidItemName")),
            itemCode: Yup.string()
                .required(i18next.t("PleaseEnterValidItemCode")),
            uom: Yup.string()
                .required(i18next.t("PleaseEnterValidUOM")),
            invoiceTaxCode: Yup.string()
                .required(i18next.t("PleaseSelectValidTaxCode")),
            invoiceUnitPrice: Yup.number()
                .positive(i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("InvoiceUnitPriceMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
        })
    );

const validationFormCreateInvSchema = (isBuyer) => Yup.object().shape({
    invoiceType: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceType")),
    supplierCode: Yup.string()
        .required(isBuyer ? i18next.t("PleaseSelectValidSupplier") : i18next.t("PleaseSelectValidBuyer")),
    invoiceDate: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceDate")),
    invoiceDueDate: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceDueDate")),
    expectedAmount: Yup.number()
        .nullable()
        .test(
            "expectedAmount",
            i18next.t("PleaseEnterValidExpectedAmount"),
            (value, testContext) => {
                const { parent } = testContext;
                return ((Number(value) && parent.expectedAmountGiven)
                    || (!Number(value) && !parent.expectedAmountGiven)
                    || (Number(value) && !parent.expectedAmountGiven)
                );
            }
        ),
    invoiceNo: Yup.string()
        .test(
            "doRequired",
            i18next.t("PleaseSelectValidInvoiceNo"),
            (value, testContext) => {
                const { parent } = testContext;
                if (parent.enablePrefix && !value) {
                    return false;
                }
                return true;
            }
        )
});
const validationFormCreateDeveloperInvSchema = (isBuyer) => Yup.object().shape({
    invoiceRefNumber: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceDate")),
    invoiceDate: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceDate")),
    invoiceDueDate: Yup.string()
        .required(i18next.t("PleaseSelectValidInvoiceDueDate"))
});
export {
    oneManualItemSchema,
    manyManualItemsSchema,
    oneSelectedItemSchema,
    manySelectedItemsSchema,
    oneNonPOItemSchema,
    manyNonPOItemsSchema,
    validationFormCreateInvSchema,
    validationFormCreateDeveloperInvSchema
};
