import { BASE_URL } from "../urlConfig/urlConfig";

const PAYMENT_BATCH_API = {
    GET_APPROVED_PAYMENT_LIST_URL: `${BASE_URL}payment/{companyUuid}/payment/approved`,
    DETAILS_PAYMENT_FOR_CREATING_PAYMENT_BATCH_URL: `${BASE_URL}payment/{companyUuid}/payment/detail/payment-batch`,
    GET_PAYMENT_BATCH_LIST_URL: `${BASE_URL}payment/{companyUuid}/payment-batch`,
    GET_INTEGRATION_PRODUCT_URL: `${BASE_URL}payment/{companyUuid}/payment-batch/bank-integration/{bankAccountUuid}`,
    CREATE_PAYMENT_BATCH_URL: `${BASE_URL}payment/{companyUuid}/payment-batch`,
    REJECT_PAYMENT_BATCH_URL: `${BASE_URL}payment/{companyUuid}/payment-batch/reject/{paymentUuid}`,
    DETAILS_PAYMENT_BATCH_URL: `${BASE_URL}payment/{companyUuid}/payment-batch/{paymentUuid}`,
    PAYMENT_BATCH_OVERVIEW: `${BASE_URL}payment/{companyUuid}/payment-batch/overview?uuid={paymentUuid}`
};

Object.freeze(PAYMENT_BATCH_API);
export default PAYMENT_BATCH_API;
