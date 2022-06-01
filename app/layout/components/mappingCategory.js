import { PR_ROUTES } from "routes/P2P/PurchaseRequest";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { CONTRACT_MODULE_ROUTE } from "services/ContractModuleService";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";
import { CREDIT_NOTE_ROUTES } from "routes/P2P/CreditNote";
import { AP_SPECIALIST_ROUTES } from "routes/EntityAdmin/ManageAPSpecialist";
import { PAYMENT_BATCH_ROUTES } from "routes/P2P/PaymentBatch";
import { GOODS_RECEIPT_ROUTES } from "routes/P2P/GoodReceipts";
import { MANAGE_ROLES_ROUTES } from "routes/EntityAdmin/ManageRoles";
import { DOXA_ADMIN_MANAGE_ROLES_ROUTES } from "routes/DoxaAdmin/ManageRoles";
import PROGRESSIVE_ROUTES from "routes/Entities/ProgressiveClaims/routes";
import URL_CONFIG from "services/urlConfig";
import i18next from "i18next";
import { RFQ_ROUTES } from "routes/P2P/RequestForQuotation";

export const mappingCategory = (featureName) => {
    switch (featureName) {
    // Contract
    case "Contract Request List":
        return { cat: "Contracts", subCat: "" };
    case "Contract Request":
        return {
            cat: "Contracts",
            pathCat: CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_LIST,
            subCat: "Contracts",
            pathSubCat: CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_LIST
        };
    case "Contract List":
        return {
            cat: "Contracts",
            pathCat: CONTRACT_MODULE_ROUTE.CONTRACT_LIST,
            subCat: "Contracts",
            pathSubCat: CONTRACT_MODULE_ROUTE.CONTRACT_LIST
        };
    case "Contract Detail":
        return {
            cat: "Contracts",
            pathCat: CONTRACT_MODULE_ROUTE.CONTRACT_LIST,
            subCat: "Contracts",
            pathSubCat: CONTRACT_MODULE_ROUTE.CONTRACT_LIST
        };

        // PPR
    case "Raise Pre-Requisition":
        return { cat: "Requisition", subCat: "Pre-Requisitions" };
    case "Purchase Pre-Requisitions List":
        return { cat: "Requisition", subCat: "Pre-Requisitions" };
    case "Pre-Requisition Details":
        return { cat: "Requisition", subCat: "Pre-Requisitions" };
    case "Pending Purchaser Review":
        return {
            cat: "Requisition",
            pathSubCat: PR_ROUTES.COVERT_PURCHASE_REQUISITION,
            subCat: "Purchase Pre-Requisitions List",
            title: "Pre-Requisition Details"
        };

        // PR
    case "Purchase Requisition List":
        return {
            cat: "Requisitions",
            subCat: "Requisitions",
            pathCat: null,
            pathSubCat: PR_ROUTES.PURCHASE_REQUISITION_LIST
        };
    case "Raise Requisition":
        return {
            cat: "Requisitions",
            subCat: "Requisitions",
            pathCat: null,
            pathSubCat: PR_ROUTES.PURCHASE_REQUISITION_LIST
        };
    case "Purchase Requisition Details":
        return {
            cat: "Requisitions",
            subCat: "Requisitions",
            subSubCat: "PRs List",
            pathCat: "",
            pathSubCat: PR_ROUTES.PURCHASE_REQUISITION_LIST,
            pathSubSubCat: PR_ROUTES.PURCHASE_REQUISITION_LIST
        };
    case "PR To Convert":
        return {
            cat: "Orders",
            subCat: "Request Pending Conversion",
            subSubCat: "PRs To Be Converted List",
            pathCat: "",
            pathSubCat: PURCHASE_ORDER_ROUTES.PR_TO_BE_CONVERTED_LIST,
            pathSubSubCat: PURCHASE_ORDER_ROUTES.PR_TO_BE_CONVERTED_LIST
        };
    case "PPR To Convert":
        return {
            cat: "Orders",
            subCat: "Request Pending Conversion",
            subSubCat: "PPRs To Be Converted List",
            pathCat: "",
            pathSubCat: PURCHASE_ORDER_ROUTES.PPR_TO_BE_CONVERTED_LIST,
            pathSubSubCat: PURCHASE_ORDER_ROUTES.PPR_TO_BE_CONVERTED_LIST
        };

        // DVO
    case "Developer Work Requisition Details": {
        return {
            cat: "Requisitions",
            pathCat: PR_ROUTES.PURCHASE_REQUISITION_LIST
        };
    }
    // DVO
    case "Developer Work Order List": {
        return {
            cat: "Orders List",
            pathCat: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST
        };
    }
    // PO
    case "Purchase Orders List":
        return {
            cat: "Orders",
            subCat: "Orders List"
        };
    case "Purchase Order Details": {
        return {
            cat: "Orders List",
            subCat: "POs List",
            pathCat: PURCHASE_ORDER_ROUTES.PO_LIST,
            pathSubCat: PURCHASE_ORDER_ROUTES.PO_LIST
        };
    }

    // Invoice
    case "Invoices List":
        return {
            cat: "Invoices",
            subCat: null,
            pathCat: INVOICE_ROUTES.INVOICE_LIST,
            pathSubCat: null
        };
    case "Create Invoice":
        return {
            cat: "Invoices",
            subCat: null,
            pathCat: INVOICE_ROUTES.INVOICE_LIST,
            pathSubCat: null
        };
    case "Invoice Details":
        return {
            cat: "Invoices",
            subCat: "Invoice List",
            pathCat: INVOICE_ROUTES.INVOICE_LIST,
            pathSubCat: INVOICE_ROUTES.INVOICE_LIST
        };
    case "Invoices Pending Approval":
        return {
            cat: "Invoices",
            subCat: "Invoices",
            pathCat: INVOICE_ROUTES.INVOICE_PENDING_APPROVAL,
            pathSubCat: INVOICE_ROUTES.INVOICE_PENDING_APPROVAL
        };
    case "Invoice Pending Approval Details":
        return {
            cat: "Invoices",
            subCat: "Invoices",
            pathCat: INVOICE_ROUTES.INVOICE_PENDING_APPROVAL,
            pathSubCat: INVOICE_ROUTES.INVOICE_PENDING_APPROVAL
        };

        // Credit Note
    case "Credit Note List":
        return {
            cat: "Invoices",
            subCat: "Credit Notes",
            pathCat: null,
            pathSubCat: null
        };
    case "Create Credit Note":
        return {
            cat: "Invoices",
            subCat: "Credit Notes",
            pathCat: null,
            pathSubCat: CREDIT_NOTE_ROUTES.CN_LIST
        };
    case "Credit Note Details":
        return {
            cat: "Invoices",
            subCat: "Credit Notes",
            subSubCat: "Credit Note List",
            pathCat: null,
            pathSubCat: CREDIT_NOTE_ROUTES.CN_LIST,
            pathSubSubCat: CREDIT_NOTE_ROUTES.CN_LIST
        };

        // Catalogue
    case "Catalogue Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };
    case "Create Catalogue Item":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };
    case "List of Catalogue":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };
    case "List of Manual Catalogue":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };

        // Bank Account
    case "List of Bank Account":
        return {
            cat: "Bank Connection",
            subCat: "Manage Bank Account"
        };
    case "Add Bank Account":
        return {
            cat: "Bank Connections",
            subCat: ""
        };
    case "Bank Account Details":
        return {
            cat: "Bank Connections",
            subCat: ""
        };
    case "Approve Bank Account":
        return {
            cat: "Bank Connections",
            subCat: ""
        };

    case "List of Approval Group":
        return {
            cat: "Entity Management",
            subCat: "Approval Setting"
        };

    case "Create New Approval Group":
        return {
            cat: "Entity Management",
            subCat: "Approval Groups Management"
        };

    case "Approval Group Details":
        return {
            cat: "Entity Management",
            subCat: "Approval Groups Management"
        };

        // Supplier Bank Account
    case "List of Supplier Bank Account":
        return {
            cat: "Bank Connection",
            subCat: "Manage Supplier Bank Account"
        };
    case "Add Supplier Bank Account":
        return {
            cat: "Bank Connections",
            subCat: ""
        };
    case "Supplier Bank Account Details":
        return {
            cat: "Bank Connections",
            subCat: ""
        };

    // AP Specialist
    case "Manage AP Specialist":
        return {
            cat: "System Configuration",
            subCat: "Vendor Management"
        };
    case "Add New AP Specialist Grouping":
        return {
            cat: "System Configuration",
            subCat: "Vendor Management",
            subSubCat: "Manage AP Specialist",
            path: null,
            pathCat: null,
            pathSubSubCat: AP_SPECIALIST_ROUTES.AP_SPECIALIST_LIST
        };
    case "AP Specialist Detail":
        return {
            cat: "System Configuration",
            subCat: "Vendor Management",
            subSubCat: "Manage AP Specialist",
            path: null,
            pathCat: null,
            pathSubSubCat: AP_SPECIALIST_ROUTES.AP_SPECIALIST_LIST
        };

    // Working Order Details
    case "Developer Work Order Details":
        return {
            cat: "Developer Work Order List",
            pathCat: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST
        };

    case "List of Payment Cycle":
        return {
            cat: "System Configuration",
            subCat: "Payment Management"
        };
    case "Create New Payment Cycle":
        return {
            cat: "System Configuration",
            subCat: "Payment Management"
        };

    // Manage Company Users
    case "Company Users List":
        return {
            cat: "Entity Management ",
            subCat: "Manage Company User"
        };

    case i18next.t("CreateNewCompanyUser"):
        return {
            cat: "Entity Management",
            subCat: "Manage Company User"
        };
    case "Company User Details":
        return {
            cat: "Entity Management",
            subCat: "Manage Company User"
        };

    case "Payment Cycle Details":
        return {
            cat: "System Configuration",
            subCat: "Payment Management"
        };

    // Company Addresses
    case "Company Address List":
    case "Create Company Address":
    case "Company Address Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "Manage Address"
        };

    case i18next.t("ListOfPaymentTerms"):
        return {
            cat: "System Configuration",
            subCat: "Payment Management"
        };

    // Payment Term Manage
    case i18next.t("CreateNewPaymentTerm"):
    case "Payment Term Details":
        return {
            cat: "System Configuration",
            subCat: "Payment Management",
            subSubCat: "Manage Payment Terms"
        };

    // Company Addresses
    case "List UOM":
    case "Create UOM":
    case "UOM Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "Manage UOM"
        };
        // Company Addresses
    case "List of G/L Account":
    case "Create G/L Account":
    case "G/L Account Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "Manage G/L Account"
        };

    // Draft progressive claim
    case "Submit a Draft Claim":
        return {
            cat: "Receipts",
            // pathCat: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST,
            subCat: "Progressive Claims"
            // pathSubCat: "Progressive Claims"
        };
    case "Create Draft Progress Claim":
        return {
            cat: "Receipts",
            subCat: "Progressive Claims"
        };
    case "Progressive Claims List":
        return {
            cat: "Receipts",
            subCat: "Progressive Claims"
        };
    case "Progress Claim Details":
        return {
            cat: "Receipts",
            subCat: "Contract Progressive Claims",
            subSubCat: "Progressive Claims List"
        };
    case "Architect Progress Claims List":
        return {
            cat: "Receipts",
            subCat: "Contractor Progressive Claims"
        };
    case "Architect Progress Claim Details":
        return {
            cat: "Receipts",
            subCat: "Contractor Progressive Claims",
            subSubCat: "Architect Progress Claims List"
        };
    case "Draft Progress Claim List":
        return {
            cat: "Receipts",
            subCat: "Contractor Progressive Claims"
        };
    case "Draft Progress Claim Details":
        return {
            cat: "Receipts",
            subCat: "Contractor Progressive Claims",
            subSubCat: "Draft Progressive Claims List",
            pathSubSubCat: PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
        };
    // Payment
    case "Payment Setting":
        return {
            cat: "System Configuration",
            subCat: "Payment Management"
        };
    case "Approved Invoices List":
        return {
            cat: "Payment",
            subCat: "Invoice Submission"
        };
    case "Pending Payment Document List":
        return {
            cat: "Payment",
            subCat: "Invoice Submission"
        };
    case "Payment List":
        return {
            cat: "Payment",
            subCat: "Invoice Submission"
        };
    case "Create Payment":
        return {
            cat: "Payment",
            subCat: "Invoice Submission"
        };
    case "Payment Details":
        return {
            cat: "Payment",
            subCat: "Invoice Submission"
        };

    // Payment
    case "Create New Approval":
        return {
            cat: "Entity Management",
            subCat: "Manage Approval Matrix"
        };
    case "Approval Details":
        return {
            cat: "Entity Management",
            subCat: "Manage Approval Matrix"
        };
    case "Manage Approval Matrix":
        return {
            cat: "Entity Management",
            subCat: ""
        };
    // Payment Batch
    case "Approved Payment List":
        return {
            cat: "Payments",
            subCat: "Payment"
        };
    case "Payment Batch List":
        return {
            cat: "Payments",
            subCat: "Payment"
        };
    case "Create Payment Batch":
        return {
            cat: "Payments",
            subCat: "Payment",
            pathSubCat: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_LIST
        };
    case "Payment Batch Details":
        return {
            cat: "Payments",
            subCat: "Payment",
            subSubCat: "Payment Batch List",
            pathSubCat: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_LIST,
            pathSubSubCat: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_LIST
        };

    // Manage Currencies
    case "List of Currency":
    case "Currency Details":
    case "Create Currency":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "Manage Currencies"
        };

    // Manage Document Prefixes
    case "List of Document Prefix":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };

    case "Document Prefix Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "List of Document Prefix"
        };

    // Manage trade codes
    case "Manage Trade Code":
        return {
            cat: "System Configuration",
            subCat: "Project Management"
        };

    case "Create New Trade Code":
    case "Trade Code Details":
        return {
            cat: "System Configuration",
            subCat: "Project Management",
            subSubCat: "Manage Trade Code"
        };

    // Manage Currencies
    case "List of Category":
    case "Create New Category":
    case "Category Details":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "Manage Category"
        };

    // Manage DO
    case "Delivery Order List":
        return {
            cat: "Receipts"
        };

    // Manage Currencies
    case "Manage Connection":
        return {
            cat: "System Configuration",
            subCat: "Vendor Management"
        };

        // Manage Currencies
    case "List of Tax Record":
        return {
            cat: "System Configuration",
            subCat: "General Setting"
        };

    case "Tax Record Details":
    case "Create Tax Record":
        return {
            cat: "System Configuration",
            subCat: "General Setting",
            subSubCat: "List of Tax Record",
            pathSubSubCat: URL_CONFIG.LIST_TAX_RECORDS
        };

    // Manage External Vendor
    case "Manage External Vendor":
    case "Create External Vendor":
    case "Vendor Details":
        return {
            cat: "System Configuration",
            subCat: "Vendor Management"
        };

    // Manage Feature Matrix
    case "Manage Feature Matrix":
        return {
            cat: "Entity Management"
        };

    // Purchase Requisitions To Be Converted List
    case i18next.t("PrePurchaseRequisitionsToBeConvertedList"):
    case "Purchase Requisitions To Be Converted List":
        return {
            cat: " Orders",
            subCat: "Request Pending Conversion"
        };
    // Projects List
    case "List of Project":
        return {
            cat: "System Configuration",
            subCat: "Project Management"
        };

    case "Create New Project":
    case "Project Details":
        return {
            cat: "System Configuration",
            subCat: "Project Management",
            subSubCat: "List of Project"
        };
    // Projects Forecast List
    case "Manage Project Forecast":
        return {
            cat: "System Configuration",
            subCat: "Project Management"
        };
    // Delivery Order
    case "Create Delivery Order":
        return {
            cat: "Receipts",
            subCat: ""
        };
    case "Delivery Order Details":
        return {
            cat: "Receipts",
            subCat: "Delivery Orders List"
        };
    case "Delivery Orders List":
        return {
            cat: "Receipts",
            subCat: ""
        };

    case "Entity Details":
        return {
            cat: "List of Entities",
            pathCat: "/entities"
        };

    // Good Receipt
    case "Receipts List":
        return { cat: "Receipts" };
    case "Create Receipt From PO":
    case "Create Receipt From DO":
    case "Create Non Order Receipt":
        return { cat: "Receipts", subCat: "" };
    case "Goods Receipt Details":
        return {
            cat: "Receipts",
            subCat: "Receipts List",
            pathCat: "",
            pathSubCat: GOODS_RECEIPT_ROUTES.GR_LIST
        };

    // Organization Users
    case "Organization Users List":
    case "Create New Organization User":
    case "Organization User Details":
        return {
            cat: "Manage Organization Users",
            subCat: "Organization Users List"
        };

    // Manage Roles
    case "List Of Role":
        return {
            cat: "Entity Management",
            subCat: "Manage Role"
        };
    case "Create New Role":
    case "Role Details":
        return {
            cat: "Entity Management",
            subCat: "Manage Role",
            subSubCat: "List of role",
            pathSubSubCat: MANAGE_ROLES_ROUTES.ROLES_LIST
        };

    // Manage Roles
    case "DoxaAdminListOfRoles":
        return {
            title: i18next.t("ListOfRoles"),
            cat: i18next.t("ManageRoles")
        };
    case "DoxaAdminCreateNewRole":
        return {
            title: i18next.t("CreateNewRole"),
            cat: i18next.t("ManageRoles"),
            subCat: i18next.t("ListOfRoles"),
            pathSubCat: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLES_LIST
        };
    case "DoxaAdminRoleDetails":
        return {
            title: i18next.t("RoleDetails"),
            cat: i18next.t("ManageRoles"),
            subCat: i18next.t("ListOfRoles"),
            pathSubCat: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLES_LIST
        };

    // Organization Users
    case "List of Companies":
        return {
            cat: "Manage Sub-Entities"
        };
    case "Company Details":
    case "Create New Company":
        return {
            cat: "Manage Sub-Entities",
            subCat: "List of Companies"
        };

    // RFQ
    case "RFQ List":
        return {
            cat: "Request for Quotations"
        };
    case "Raise RFQ":
        return {
            cat: "Request for Quotations"
        };
    case "RFQ Details":
        return {
            cat: "Request for Quotations",
            subCat: "RFQ List",
            pathSubCat: RFQ_ROUTES.RFQ_LIST
        };

    // Manage Approval Configuration
    case i18next.t("ApprovalConfiguration"):
        return {
            cat: "Entity Management",
            subCat: "Approval Setting"
        };
    default:
        return {
            cat: null,
            subCat: null
        };
    }
};
export default mappingCategory;
