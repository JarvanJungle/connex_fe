import * as Yup from "yup";
import i18next from "i18next";

const itemSchema = Yup.array()
    .of(
        Yup.object().shape({
            itemCode: Yup.string()
                .required(i18next.t("ItemCodeIsRequired")),
            itemName: Yup.string()
                .required(i18next.t("ItemNameIsRequired")),
            uomCode: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidUOM")),
            currencyCode: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidSourceCurrency")),
            itemUnitPrice: Yup.number()
                .required(i18next.t("ItemOrderPleaseEnterValidUnitPrice")),
            taxCode: Yup.string()
                .required(i18next.t("ItemReqPleaseSelectValidTaxCode")),
            // requestedDeliveryDate: Yup.string()
            //     .required(i18next.t("ItemOrderPleaseEnterValidRequestedDeliveryDate")),
            // deliveryAddress: Yup.string()
            //     .required(i18next.t("ItemOrderPleaseSelectValidAddress")),
            itemQuantity: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (qty) => qty > 0
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

export default itemSchema;
