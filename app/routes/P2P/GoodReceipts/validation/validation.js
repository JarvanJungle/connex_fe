import * as Yup from "yup";
import i18next from "i18next";

const itemsOrderedNonPOSchema = Yup.array()
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
            uomCode: Yup.string()
                .required(i18next.t("ItemOrderPleaseSelectValidUOMCode")),
            qtyReceiving: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "positive-integer",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
        })
    );

const itemsOrderedPOSchema = Yup.array()
    .of(
        Yup.object().shape({
            qtyReceiving: Yup.number()
                .positive(i18next.t("QuantityMustBeGreaterThanZero"))
                .test(
                    "qty-receiving-validation",
                    i18next.t("QuantityMustBeGreaterThanZero"),
                    (qtyReceiving) => qtyReceiving > 0
                )
                .test(
                    "qty-receiving-validation",
                    i18next.t("QuantityReceivingCannotBeGreaterThanPendingDeliveryQuantity"),
                    (qtyReceiving, testContext) => {
                        const { parent } = testContext;
                        return qtyReceiving <= parent.qtyPendingDelivery;
                    }
                )
        })
    );

export {
    itemsOrderedNonPOSchema,
    itemsOrderedPOSchema
};
