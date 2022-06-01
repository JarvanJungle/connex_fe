import * as Yup from "yup";
import i18next from "i18next";

const itemPOSchema = Yup.array()
    .of(
        Yup.object().shape({
            address: Yup.object()
                .required(i18next.t("ItemOrderPleaseSelectValidAddress"))
                .test(
                    "not-valid-address",
                    i18next.t("ItemOrderPleaseSelectValidAddress"),
                    (address) => Object.keys(address).length > 0
                ),
            itemCode: Yup.string()
                .required(i18next.t("ItemOrderPleaseEnterValidItemCode")),
            itemName: Yup.string()
                .required(i18next.t("ItemOrderPleaseEnterValidItemName")),
            uom: Yup.string()
                .required(i18next.t("ItemOrderPleaseSelectValidUOM")),
            sourceCurrency: Yup.string()
                .required(i18next.t("ItemOrderPleaseSelectValidCurrency")),
            taxCode: Yup.string()
                .required(i18next.t("ItemOrderPleaseEnterValidTaxCode")),
            requestedDeliveryDate: Yup.string()
                .required(i18next.t("ItemOrderPleaseEnterValidRequestedDeliveryDate")),
            itemQuantity: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (itemQuantity) => itemQuantity > 0
                ),
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
                )
        })
    );

export default itemPOSchema;
