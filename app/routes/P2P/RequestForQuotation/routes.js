const prefix = "/rfq";

const RFQ_ROUTES = {
    RFQ_LIST: `${prefix}/rfq-list`,
    RAISE_RFQ: `${prefix}/raise-rfq`,
    ISSUE_RFQ: `${prefix}/issue-rfq`,
    RFQ_DETAILS: `${prefix}/rfq-details`,
    RFQ_DETAILS_SUPPLIER: `${prefix}/rfq-details-supplier`,
    RFQ_DETAILS_UNCONNECTED_SUPPLIER: `${prefix}/rfq-details-unconnected-supplier`,
    RFQ_IN_PROCESS: `${prefix}/rfq-in-process`
};

Object.freeze(RFQ_ROUTES);
export default RFQ_ROUTES;
