export const ApprovedInvoiceListDummyData = [
    {
        invoiceNo: "INV-000000001",
        vendorName: "Peck Tiong Choon Pte. Ltd.",
        dueDate: "05/06/2021",
        invoiceDueDate: "05/06/2021",
        systemDueDate: "28/06/2021",
        overDue: "54",
        totalAmount: "SGD 40.80",
        paidAmount: "SGD 0.00",
        pendingPaymentAmount: "SGD 470.80",
        overDueOver60Day: "0",
        overDueUnder60Day: "0",
        overDueUnder30Day: "0",
        paymentStatus: "NOT PAID",
        paymentReferenceNo: "",
        submissionDate: "05/06/2021",
        invoiceDate: "05/06/2021",
        paymentTerms: "30",
        approvedBy: "cookie",
        invoiceStatus: "APPROVED 2 WAY"
    },
    {
        invoiceNo: "INV-000000002",
        vendorName: "AUYIN OFFICE FURNITURE PTE LTD",
        dueDate: "17/03/2021",
        invoiceDueDate: "17/03/2021",
        systemDueDate: "28/03/2021",
        overDue: "54",
        totalAmount: "SGD 2571.21",
        paidAmount: "SGD 2,300.00",
        pendingPaymentAmount: "SGD 271.21",
        overDueOver60Day: "0",
        overDueUnder60Day: "SGD 271.21",
        overDueUnder30Day: "0",
        paymentStatus: "PARTIALLY PAID",
        paymentReferenceNo: "PAY-000000010, PAY-000000005",
        submissionDate: "15/02/2021",
        invoiceDate: "15/02/2021",
        paymentTerms: "30",
        approvedBy: "Li",
        invoiceStatus: "APPROVED 3 WAY"
    }
];

export const PaymentInvoicesDummyData = [
    {
        invoiceNo: "INV-000000001",
        vendorName: "Peck Tiong Choon Pte. Ltd.",
        subTotal: "SGD 1,869.00",
        taxAmount: "SGD 130.00",
        totalAmount: "SGD 2,000.00",
        paidAmount: "SGD 0.00",
        processingPaymentAmount: "SGD 2.00",
        outstandingAmount: "SGD 2,000.00",
        amountToPay: "",
        payAll: true,
        submissionDate: "06/06/2021",
        invoiceDate: "05/06/2021",
        paymentTerms: "30",
        dueDateFromSubmission: "05/06/2021",
        invoiceDueDate: "05/06/2021",
        systemDueDate: "28/06/2021",
        overDue: "54",
        paymentStatus: "NOT PAID",
        paymentNo: "PAY-00000008",
        overDueOver60Day: "0",
        overDueUnder60Day: "0",
        overDueUnder30Day: "0"
    },
    {
        invoiceNo: "INV-000000002",
        vendorName: "Peck Tiong Choon Pte. Ltd.",
        subTotal: "SGD 1,869.00",
        taxAmount: "SGD 130.00",
        totalAmount: "SGD 2,000.00",
        paidAmount: "SGD 0.00",
        processingPaymentAmount: "SGD 2.00",
        outstandingAmount: "SGD 2,000.00",
        amountToPay: "",
        payAll: true,
        submissionDate: "06/06/2021",
        invoiceDate: "05/06/2021",
        paymentTerms: "30",
        dueDateFromSubmission: "05/06/2021",
        invoiceDueDate: "05/06/2021",
        systemDueDate: "28/06/2021",
        overDue: "54",
        paymentStatus: "NOT PAID",
        paymentNo: "PAY-00000008",
        overDueOver60Day: "0",
        overDueUnder60Day: "0",
        overDueUnder30Day: "0"
    }
];

export const PaymentListDummyData = [
    {
        paymentNo: "PAY-000000001",
        status: "SAVED AS DRAFT",
        paymentReleaseDate: "06/03/2021",
        beneficiary: "S001 (NatSteel Holdings Pte Ltd)",
        totalAmount: "SGD 2,000.00",
        dueDate: "06/28/2021",
        paymentReferenceNo: "P11051614",
        currency: "SGD",
        approvalRoute: "ROUTE1",
        approvalSequence: "admin2",
        nextApprover: "",
        createdBy: "admin5",
        createdDate: "05/11/2021"
    },
    {
        paymentNo: "PAY-000000002",
        status: "PAID",
        paymentReleaseDate: "05/25/2021",
        beneficiary: "S001 (NatSteel Holdings Pte Ltd)",
        totalAmount: "SGD 2,000.00",
        dueDate: "06/28/2021",
        paymentReferenceNo: "P11051218",
        currency: "SGD",
        approvalRoute: "ROUTE1",
        approvalSequence: "admin2",
        nextApprover: "",
        createdBy: "admin5",
        createdDate: "05/11/2021"
    }
];

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

const PAYMENT_ROLES = {
    CREATOR: "CREATOR",
    APPROVER: "APPROVER",
    HAS_APPROVED: "HAS_APPROVED"
};
const PAYMENT_STATUS = {
    CREATE_PAYMENT: "CREATE_PAYMENT",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    APPROVED: "APPROVED",
    SAVED_AS_DRAFT: "SAVED_AS_DRAFT",
    PAID: "PAID",
    SENT_BACK: "SENT_BACK",
    REJECTED: "REJECTED",
    TIMEOUT: "TIMEOUT"
};
const PAYMENT_FE_STATUS = {
    CREATE_PAYMENT: "CREATE PAYMENT",
    PENDING_APPROVAL: "PENDING APPROVAL",
    APPROVED: "APPROVED",
    SAVED_AS_DRAFT: "PENDING SUBMISSION",
    PAID: "PAID",
    SENT_BACK: "SENT BACK",
    REJECTED: "REJECTED",
    TIMEOUT: "TIMEOUT"
};

const PAYMENT_AUDIT_TRAIL_ROLE = {
    SAVE_AS_DRAFT: "SAVE_AS_DRAFT",
    SUBMIT: "SUBMIT",
    SEND_BACK: "SEND_BACK",
    REJECT: "REJECT",
    APPROVED: "APPROVED"
};

const PAYMENT_AUDIT_TRAIL_ROLE_CONVERT = {
    SAVE_AS_DRAFT: "Saved Payment As Draft",
    SUBMIT: "Submitted Payment",
    SEND_BACK: "Sent Back Payment",
    REJECT: "Rejected Payment",
    APPROVED: "Approved Payment"
};

Object.freeze(PAYMENT_STATUS);
Object.freeze(PAYMENT_FE_STATUS);
Object.freeze(PAYMENT_ROLES);
Object.freeze(PAYMENT_AUDIT_TRAIL_ROLE);
Object.freeze(PAYMENT_AUDIT_TRAIL_ROLE_CONVERT);

export {
    PAYMENT_STATUS,
    PAYMENT_FE_STATUS,
    PAYMENT_ROLES,
    PAYMENT_AUDIT_TRAIL_ROLE,
    PAYMENT_AUDIT_TRAIL_ROLE_CONVERT
};
