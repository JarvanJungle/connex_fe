const prefix = "/payment-batch";
const PAYMENT_BATCH_ROUTES = {
    APPROVED_PAYMENT_LIST: `${prefix}/approved-payment-list`,
    PAYMENT_BATCH_LIST: `${prefix}/payment-batch-list`,
    PAYMENT_BATCH_DETAILS: `${prefix}/payment-batch-details`,
    PAYMENT_BATCH_CREATE: `${prefix}/payment-batch-create`
};

Object.freeze(PAYMENT_BATCH_ROUTES);
export default PAYMENT_BATCH_ROUTES;
