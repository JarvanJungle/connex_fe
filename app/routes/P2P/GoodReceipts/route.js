const prefix = "/good-receipts";

const GOODS_RECEIPT_ROUTES = {
    GR_LIST: `${prefix}/gr-list`,
    GR_LIST_GR_DETAILS: `${prefix}/gr-details`,
    GR_FROM_DO_LIST: "/gr-from-do-list/list",
    DO_FLIP_TO_GR: "/gr-from-do-list/do-details",
    CREATE_GR_FROM_DO: "/gr-from-do-list/create-receipt-from-do",
    GR_FROM_PO_LIST: "/gr-from-po-list",
    CREATE_GR_FROM_PO: `${prefix}/create-receipt-from-po`,
    CREATE_GR_FROM_NON_PO: "/create-receipt-from-non-po"
};

Object.freeze(GOODS_RECEIPT_ROUTES);
export default GOODS_RECEIPT_ROUTES;
