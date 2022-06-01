const prefix = "/payment";
const PAYMENT_ROUTE = {
    APPROVED_INVOICE_LIST: `${prefix}/approved-invoice-list`,
    PENDING_PAYMENT_LIST: `${prefix}/pending-payment-list`,
    PAYMENT_LIST: `${prefix}/payment-list`,
    PAYMENT_DETAILS: `${prefix}/payment-details`,
    PAYMENT_CREATE: `${prefix}/payment-create`,
    PAYMENT_SETTING: `${prefix}/payment-setting`,
    INV_DETAILS: "/invoice-details",
};

Object.freeze(PAYMENT_ROUTE);
export default PAYMENT_ROUTE;
