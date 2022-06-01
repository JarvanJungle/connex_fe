import URL_CONFIG from "services/urlConfig";
import i18next from "i18next";
import { CONTRACT_MODULE_ROUTE } from "services/ContractModuleService";
import DEVELOPER_WR_MODULE_ROUTE from "services/DeveloperWorkRequestService/urls";
import ListDWRequistions from "routes/Pages/Requisitions/Requisitions/DWR/ListDWRequisitions";
import TwoFA from "./Pages/TwoFA";
import TwoFAVerification from "./Pages/TwoFAVerification";
import TwoFALogin from "./Pages/TwoFALogin";
import Login from "./Pages/Login";
import OthersPassword from "./Pages/OthersPassword";
import ResetOwnPassword from "./Pages/ResetOwnPassword";
import Settings from "./Pages/Settings";

import CreateEntity from "./DoxaAdmin/CreateEntity";
import ListEntity from "./DoxaAdmin/ListEntity";
import ViewEntityDetails from "./DoxaAdmin/ViewEntityDetails";

import CreateCompany from "./EntityAdmin/ManageCompany/CreateCompany";
import ListCompany from "./EntityAdmin/ManageCompany/ListCompany";
import CompanyDetails from "./EntityAdmin/ManageCompany/CompanyDetails";

import CreateCurrency from "./EntityAdmin/ManageCurrency/CreateCurrency";
import ListCurrency from "./EntityAdmin/ManageCurrency/ListCurrency";
import CurrencyDetails from "./EntityAdmin/ManageCurrency/CurrencyDetails";

import SetupPassword from "./Pages/SetupPassword";
import Success from "./Pages/Success/Success";
import Error404 from "./Pages/Error404/Error404";
// import DashBoard from "./DoxaAdmin/Dashboard/Dashboard";
import DashboardMain from "./DoxaAdmin/Dashboard/DashboardMain";
import ListEntityUsers from "./Entities/ListEntityUsers";
import UserDetails from "./Entities/UserDetails";
import CreateUser from "./Entities/CreateUser";

import ListAddresses from "./Entities/ManageAddress/ListAddresses";
import AddressDetails from "./Entities/ManageAddress/AddressDetails";

import ListGL from "./EntityAdmin/ManageGL/ListGL/ListGL";
import GLDetails from "./EntityAdmin/ManageGL/GLDetails/GLDetails";

import ListConnection from "./EntityAdmin/ManageConnection/ListConnection";
import ConnectionDetails from "./EntityAdmin/ManageConnection/ConnectionDetails";

import ListUOM from "./EntityAdmin/ManageUOM/ListUOM";
import UOMDetails from "./EntityAdmin/ManageUOM/UOMDetails";

import ListTaxRecord from "./EntityAdmin/ManageTaxRecord/ListTaxRecord";
import TaxRecordDetails from "./EntityAdmin/ManageTaxRecord/TaxRecordDetails";

import CatalogueDetails from "./EntityAdmin/ManageCatalogue/CatalogueDetails/CatalogueDetails";
import ListCatalogues from "./EntityAdmin/ManageCatalogue/ListCatalogues/ListCatalogues";

import ListProjectTrade from "./EntityAdmin/ManageProjectTrade/View/ListProjectTrade";
import ListProjectTradeDetail from "./EntityAdmin/ManageProjectTrade/Detail/ListProjectTradeDetail";

import ManageAdminMatrix from "./EntityAdmin/ManageAdminMatrix";
import { ListProjectForecast, ProjectForecastDetails, ProjectForecast } from "./EntityAdmin/ManageProjectForeCast";
import { ListVendor, VendorDetails } from "./EntityAdmin/ManageExternalVendor";
import { CreateProject, ListProject, ProjectDetails } from "./EntityAdmin/ManageProject";
import {
    RaiseRequisition,
    PurchaseRequisitionList,
    PurchaseRequisitionDetails,
    EditPurchaseRequisitionDetails,
    SubmitPurchaseRequisition,
    ConvertPrePurchaseRequisition,
    PR_ROUTES
} from "./P2P/PurchaseRequest";

import {
    RaisePreRequisitions,
    PurchasePreRequisitionList
} from "./PreRequisitions";

import ManageDocumentTemplate from "./EntityAdmin/ManageDocumentTemplate";

import ListPaymentTerms from "./EntityAdmin/ManagePaymentTerm/ListPaymentTerms/ListPaymentTerms";
import PaymentTermDetails from "./EntityAdmin/ManagePaymentTerm/PaymentTermDetails/PaymentTermDetails";
import ListApprovalGroups from "./EntityAdmin/ManageApprovalGroup/ListApprovalGroups/ListApprovalGroups";
import ApprovalGroupDetails from "./EntityAdmin/ManageApprovalGroup/ApprovalGroupDetails/ApprovalGroupDetails";
import ListApprovalMatrix from "./EntityAdmin/ManageApprovalMatrix/ListApprovalMatrix/ListApprovalMatrix";
import ApprovalMatrixDetails from "./EntityAdmin/ManageApprovalMatrix/ApprovalMatrixDetails/ApprovalMatrixDetails";
import {
    DeliveryOrderList, DeliveryOrderCreate, DeliveryOrderDetails, DO_ROUTES
} from "./EntityAdmin/DeliveryOrder";
import FeaturesMatrix from "./EntityAdmin/ManageFeaturesMatrix/FeaturesMatrix";
import DocumentPrefixDetails from "./EntityAdmin/ManageDocumentPrefix/DocumentPrefixDetails/DocumentPrefixDetails";
import DOCUMENT_PREFIX_ROUTES from "./EntityAdmin/ManageDocumentPrefix/routes";
import ListDocumentPrefixes from "./EntityAdmin/ManageDocumentPrefix/ListDocumentPrefixes/ListDocumentPrefixes";

import ContractFormRequest from "./Pages/Contract/ContractRequestForm/ContractFormRequest";
import ContractForm from "./Pages/Contract/ContractForm/ContractForm";
import ContractRequestList from "./Pages/Contract/ContractRequestList/ContractRequestList";
import ContractList from "./Pages/Contract/ContractList/ContractList";

// DWR
import DeveloperWorkRequestDetails from "./Pages/Requisitions/Requisitions/DWR/DeveloperWorkRequestDetails";

import {
    PURCHASE_ORDER_ROUTES,
    POList,
    ConvertToPO,
    PODetails,
    DeveloperWorkOrderList,
    DeveloperWorkOrderDetails,
    PRToBeConvertedList,
    PPRToBeConvertedList
} from "./P2P/PurchaseOrder";
import CategoryDetails from "./EntityAdmin/ManageCategory/CategoryDetails";
import ListCategory from "./EntityAdmin/ManageCategory/ListCategory";
import ListManualCatalogues from "./EntityAdmin/ManageCatalogue/ListManualCatalogues/ListManualCatalogues";
import {
    GOODS_RECEIPT_ROUTES,
    GRList,
    GRFromDOList,
    DOFlipToGR,
    GRFromPOList,
    GRDetails,
    CreateGRFromDO,
    CreateGRFromPO,
    CreateGRFromNonPO
} from "./P2P/GoodReceipts";
import SubmitDraftClaim from "./Entities/ProgressiveClaims/CreateDraftProgressClaim/SubmitDraftClaim";
import WorkOrderDetail from "./Entities/ProgressiveClaims/CreateDraftProgressClaim/WorkOrderDetail";
import DraftProgressiveClaimList from "./Entities/ProgressiveClaims/DraftProgressiveClaimList/ProgressClaimList";
import RecallCancel from "./Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel";
import CreateOfficialProgressClaim from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/CreateOfficialProgressClaim";
import OfficialProgressiveClaimList from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/OfficialProgressiveClaimList";
import ArchitectProgressiveClaimList from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/ArchitectProgressiveClaimList";
import ListBankAccount from "./EntityAdmin/ManageBankAccount/ListBankAccount";
import BankAccountDetail from "./EntityAdmin/ManageBankAccount/BankAccountDetail/BankAccountDetail";
import SupplierBankAccountList from "./EntityAdmin/ManageSupplierBankAccount/SupplierBankAccountList";
import SupplierBankAccountDetails from "./EntityAdmin/ManageSupplierBankAccount/SupplierBankAccountDetails";
import {
    INVOICE_ROUTES,
    InvoiceList,
    CreateInvoice,
    InvoiceDetails
} from "./P2P/Invoice";
import {
    CREDIT_NOTE_ROUTES,
    CNList,
    CreateCN,
    CNDetails
} from "./P2P/CreditNote";
import {
    PAYMENT_BATCH_ROUTES,
    ApprovedPaymentList,
    PaymentBatchList,
    PaymentBatchCreate,
    PaymentBatchDetails
} from "./P2P/PaymentBatch";

import CATALOGUES_ROUTE from "./EntityAdmin/ManageCatalogue/route";
import InvoicePendingApprovalList from "./P2P/Invoice/InvoicePendingApprovalList/InvoicePendingApprovalList";
import InvoicePendingAPDetails from "./P2P/Invoice/InvoicePendingAPDetails/InvoicePendingAPDetails";
import PAYMENT_ROUTE from "./P2P/Payment/route";
import ApprovedInvoiceList from "./P2P/Payment/ApprovedInvoiceList/ApprovedInvoiceList";

import {
    AP_SPECIALIST_ROUTES,
    ListAPSpecialist,
    APSpecialistDetails
} from "./EntityAdmin/ManageAPSpecialist";
import PaymentSetting from "./EntityAdmin/ManagePaymentTerm/PaymentSetting/PaymentSetting";
import PendingPaymentList from "./P2P/Payment/PendingPaymentList/PendingPaymentList";
import PaymentDetails from "./P2P/Payment/PaymentDetails/PaymentDetails";
import PAYMENT_CYCLE_ROUTE from "./EntityAdmin/ManagePaymentCycle/routes";
import PaymentCyclesList from "./EntityAdmin/ManagePaymentCycle/PaymentCyclesList/PaymentCyclesList";
import CreatePaymentCycle from "./EntityAdmin/ManagePaymentCycle/CreatePaymentCycle/CreatePaymentCycle";
import PaymentList from "./P2P/Payment/PaymentList/PaymentList";
import UpdatePaymentCycle from "./EntityAdmin/ManagePaymentCycle/UpdatePaymentCycle/UpdatePaymentCycle";
import OfficialProgressiveClaimFormDetail from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/OfficialProgressiveClaimFormDetail/OfficialProgressiveClaimFormDetail";
import ArchitectProgressiveClaimFormDetail from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/ArchitectProgressiveClaimFormDetail/ArchitectProgressiveClaimFormDetail";
import OfficialProgressiveClaimWorkOrderDetail from "./Entities/ProgressiveClaims/OfficialProgressiveClaim/OfficialProgressiveClaimWorkOrderDetail";
import {
    RolesList,
    RoleDetails,
    MANAGE_ROLES_ROUTES
} from "./EntityAdmin/ManageRoles";
import {
    DoxaAdminRolesList,
    DoxaAdminRoleDetails,
    DOXA_ADMIN_MANAGE_ROLES_ROUTES
} from "./DoxaAdmin/ManageRoles";
import {
    RFQ_ROUTES,
    RFQsList,
    RaiseRFQ,
    RFQDetailsBuyer,
    RFQDetailsSupplier
} from "./P2P/RequestForQuotation";
import CompanyDetailsCurrent from "./EntityAdmin/ManageCompany/CompanyDetails/CompanyDetailsCurrent";
import { ManageApprovalConfig, MANAGE_APPROVAL_CONFIG_ROUTES } from "./EntityAdmin/ManageApprovalConfig";

const PreRequisitionPaths = [
    {
        path: URL_CONFIG.PPR_ROUTING.RAISE_PRE_REQUISITIONS,
        isProtected: true,
        name: "Raise Pre-Requisition",
        Component: RaisePreRequisitions,
        render: true
    },
    {
        path: URL_CONFIG.PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST,
        isProtected: true,
        name: "Purchase Pre-Requisitions List",
        Component: PurchasePreRequisitionList,
        render: true
    },
    {
        path: URL_CONFIG.PPR_ROUTING.DETAIL_PRE_REQUISITIONS,
        isProtected: true,
        name: "Pre-Requisition Details",
        Component: RaisePreRequisitions,
        render: true
    }
];

const ProgressiveClaims = [
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.SUBMIT_DRAFT_CLAIM,
        isProtected: true,
        name: "Submit a Draft Claim",
        Component: SubmitDraftClaim,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.SUBMIT_DRAFT_CLAIM_CREATE,
        isProtected: true,
        name: "Create Draft Progress Claim",
        Component: WorkOrderDetail,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.SUBMIT_DRAFT_CLAIM_EDIT,
        isProtected: true,
        name: "Progressive Claims",
        Component: WorkOrderDetail,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.SUBMIT_DRAFT_CLAIM_DETAIL,
        isProtected: true,
        name: "Work Order Details",
        Component: WorkOrderDetail,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE,
        isProtected: true,
        name: "Draft Progress Claim Details",
        Component: RecallCancel,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST,
        isProtected: true,
        name: "Draft Progress Claim List",
        Component: DraftProgressiveClaimList,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_DETAIL,
        isProtected: true,
        name: "Draft Progress Claim Details",
        Component: RecallCancel,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_EDIT,
        isProtected: true,
        name: "Edit Draft Progress Claim",
        Component: RecallCancel,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.OFFICIAL_PROGRESS_CLAIM_LIST_CREATE,
        isProtected: true,
        name: "Progress Claim Details",
        Component: OfficialProgressiveClaimFormDetail,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.CREATE_DEVELOPER_PROGRESS_CLAIM,
        isProtected: true,
        name: "Create Developer Progress Claim",
        Component: CreateOfficialProgressClaim,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.OFFICIAL_PROGRESS_CLAIM_LIST,
        isProtected: true,
        name: "Progressive Claims List",
        Component: OfficialProgressiveClaimList,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.WO_DETAILS_CREATE,
        isProtected: true,
        name: "Work Order Details",
        Component: OfficialProgressiveClaimWorkOrderDetail,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST,
        isProtected: true,
        name: "Architect Progress Claims List",
        Component: ArchitectProgressiveClaimList,
        render: true
    },
    {
        path: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST_CREATE,
        isProtected: true,
        name: "Architect Progress Claim Details",
        Component: ArchitectProgressiveClaimFormDetail,
        render: true
    }
];

const ManageBankAccountRoutes = [
    {
        path: URL_CONFIG.BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST,
        isProtected: true,
        name: "List of Bank Account",
        Component: ListBankAccount,
        render: true
    },
    {
        path: URL_CONFIG.BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_CREATE,
        isProtected: true,
        name: "Add Bank Account",
        Component: BankAccountDetail,
        render: true
    },
    {
        path: URL_CONFIG.BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_DETAILS,
        isProtected: true,
        name: "Bank Account Details",
        Component: BankAccountDetail,
        render: true
    }
];

const ManageSupplierBankAccountRoutes = [
    {
        path: URL_CONFIG.SUPPLIER_BANK_ACCOUNT_ROUTES_PATH.SUPPLIER_BANK_ACCOUNT_LIST,
        isProtected: true,
        name: "List of Supplier Bank Account",
        Component: SupplierBankAccountList,
        render: true
    },
    {
        path: URL_CONFIG.SUPPLIER_BANK_ACCOUNT_ROUTES_PATH.SUPPLIER_BANK_ACCOUNT_CREATE,
        isProtected: true,
        name: "Add Supplier Bank Account",
        Component: SupplierBankAccountDetails,
        render: true
    },
    {
        path: URL_CONFIG.SUPPLIER_BANK_ACCOUNT_ROUTES_PATH.SUPPLIER_BANK_ACCOUNT_DETAILS,
        isProtected: true,
        name: "Supplier Bank Account Details",
        Component: SupplierBankAccountDetails,
        render: true
    }
];

export default [
    {
        path: "/entities", doxaAdmin: true, name: "List of Entities", Component: ListEntity
    },
    {
        path: "/create-entity", doxaAdmin: true, name: "Onboard New Entity", Component: CreateEntity
    },
    {
        path: "/entity-details", doxaAdmin: true, name: "Entity Details", Component: ViewEntityDetails
    },
    {
        path: "/companies", isProtected: true, name: "List of Companies", Component: ListCompany
    },
    {
        path: "/create-company", isProtected: true, name: "Create New Company", Component: CreateCompany
    },
    {
        path: "/company-details", isProtected: true, name: "Company Details", Component: CompanyDetails
    },
    {
        path: "/current-company-details", isProtected: true, name: "Current Company Details", Component: CompanyDetailsCurrent
    },

    {
        path: "/currencies", isProtected: true, name: "List of Currency", Component: ListCurrency
    },
    {
        path: "/create-currency", isProtected: true, name: "Create Currency", Component: CreateCurrency
    },
    {
        path: "/currency-details", isProtected: true, name: "Currency Details", Component: CurrencyDetails
    },

    {
        path: "/dashboard", name: "Dashboard", isProtected: true, Component: DashboardMain
    },
    {
        path: "/success", name: "Success", isProtected: false, Component: Success
    },
    {
        path: "/setup-password", name: "Setup Password", isProtected: true, Component: SetupPassword, render: true
    },
    {
        path: "/login", name: "Login", isProtected: false, Component: Login, render: true
    },
    {
        path: "/me/settings", name: "Settings", isProtected: true, Component: Settings, render: true
    },
    {
        path: "/twofa", name: "Two FA Sign Up", isProtected: true, Component: TwoFA, render: true
    },
    {
        path: "/twofa/verification", name: "2FA verification", isProtected: true, Component: TwoFAVerification, render: true
    },
    {
        path: "/twofa/login", name: "Two FA Login", isProtected: true, Component: TwoFALogin, render: true
    },
    {
        path: "/me/settings/password/reset/own", name: "Reset Your Own Password", isProtected: true, Component: ResetOwnPassword, render: true
    },
    {
        path: "/404", name: "Not found", isProtected: false, Component: Error404, render: true
    },

    {
        path: "/organization/users/list", isProtected: true, name: "Organization Users List", Component: ListEntityUsers, render: true
    },
    {
        path: "/organization/users/details", isProtected: true, name: "Organization User Details", Component: UserDetails, render: true
    },
    {
        path: "/organization/users/create", isProtected: true, name: "Create New Organization User", Component: CreateUser, render: true
    },
    {
        path: "/users/password/reset/:uuid", name: "Reset Password", isProtected: true, Component: OthersPassword, render: true
    },

    {
        path: "/company/users", isProtected: true, name: "Company Users List", Component: ListEntityUsers, render: true
    },
    {
        path: "/company-users/create", isProtected: true, name: i18next.t("CreateNewCompanyUser"), Component: CreateUser, render: true
    },
    {
        path: "/company-users/details", isProtected: true, name: i18next.t("CompanyUserDetails"), Component: UserDetails, render: true
    },

    {
        path: "/company/addresses", isProtected: true, name: "Company Address List", Component: ListAddresses, render: true
    },
    {
        path: "/company/address-details", isProtected: true, name: "Company Address Details", Component: AddressDetails, render: true
    },
    {
        path: "/company/create-address", isProtected: true, name: "Create Company Address", Component: AddressDetails, render: true
    },

    {
        path: "/connections", isProtected: true, name: i18next.t("ManageConnection"), Component: ListConnection, render: true
    },
    {
        path: "/connections/connection-details", isProtected: true, name: "Connection Details", Component: ConnectionDetails, render: true
    },

    {
        path: "/uom/list", isProtected: true, name: "List UOM", Component: ListUOM, render: true
    },
    {
        path: "/create-uom", isProtected: true, name: "Create UOM", Component: UOMDetails
    },
    {
        path: "/uom/details", isProtected: true, name: "UOM Details", Component: UOMDetails
    },

    {
        path: "/gls", isProtected: true, name: "List of G/L Account", Component: ListGL, render: true
    },
    {
        path: "/gl-details", isProtected: true, name: "G/L Account Details", Component: GLDetails, render: true
    },
    {
        path: "/create-gl", isProtected: true, name: "Create G/L Account", Component: GLDetails, render: true
    },

    {
        path: "/tax-records", isProtected: true, name: "List of Tax Record", Component: ListTaxRecord, render: true
    },
    {
        path: "/tax-record-details", isProtected: true, name: "Tax Record Details", Component: TaxRecordDetails, render: true
    },
    {
        path: "/create-tax-record", isProtected: true, name: "Create Tax Record", Component: TaxRecordDetails, render: true
    },
    {
        path: CATALOGUES_ROUTE.MANAGE_CATALOGUES, isProtected: true, name: "List of Catalogue", Component: ListCatalogues, render: true
    },
    {
        path: CATALOGUES_ROUTE.MANAGE_MANUAL_CATALOGUES, isProtected: true, name: "List of Manual Catalogue", Component: ListManualCatalogues, render: true
    },
    {
        path: CATALOGUES_ROUTE.MANAGE_CATALOGUES_DETAILS, isProtected: true, name: "Catalogue Details", Component: CatalogueDetails, render: true
    },
    {
        path: CATALOGUES_ROUTE.MANAGE_CATALOGUES_CREATE, isProtected: true, name: "Create Catalogue Item", Component: CatalogueDetails, render: true
    },

    {
        path: "/list-trade-code", isProtected: true, name: "Manage Trade Code", Component: ListProjectTrade, render: true
    },
    {
        path: "/create-trade-code", isProtected: true, name: "Create New Trade Code", Component: ListProjectTradeDetail, render: true
    },
    {
        path: "/trade-code-details", isProtected: true, name: "Trade Code Details", Component: ListProjectTradeDetail, render: true
    },
    {
        path: "/manage-admin-matrix", isProtected: true, name: "Manage Admin Matrix", Component: ManageAdminMatrix, render: true
    },
    ...PreRequisitionPaths,
    {
        path: "/list-project-forecast", isProtected: true, name: i18next.t("ManageProjectForecast"), Component: ListProjectForecast, render: true
    },
    {
        path: "/list-project-forecast/details", isProtected: true, name: i18next.t("ProjectForecastUpdate"), Component: ProjectForecastDetails, render: true
    },
    {
        path: "/list-project-forecast/forecast", isProtected: true, name: i18next.t("ForecastTrade"), Component: ProjectForecast, render: true
    },
    {
        path: "/list-ext-vendor", isProtected: true, name: i18next.t("ManageExtVendor"), Component: ListVendor, render: true
    },
    {
        path: "/external-vendor/create", isProtected: true, name: i18next.t("CreateExtVendor"), Component: VendorDetails, render: true
    },
    {
        path: "/external-vendor/details", isProtected: true, name: i18next.t("ExtVendorEdit"), Component: VendorDetails, render: true
    },
    {
        path: "/manage-project", isProtected: true, name: i18next.t("ListOfProject"), Component: ListProject, render: true
    },
    {
        path: "/create-project", isProtected: true, name: i18next.t("Create New Project"), Component: CreateProject, render: true
    },
    {
        path: "/project-details", isProtected: true, name: i18next.t("ProjectDetails"), Component: ProjectDetails, render: true
    },
    {
        path: "/payment-terms", isProtected: true, name: i18next.t("ListOfPaymentTerms"), Component: ListPaymentTerms, render: true
    },
    {
        path: "/create-payment-terms", isProtected: true, name: i18next.t("CreateNewPaymentTerm"), Component: PaymentTermDetails, render: true
    },
    {
        path: "/payment-term-details", isProtected: true, name: "Payment Term Details", Component: PaymentTermDetails, render: true
    },
    {
        path: "/approval-groups", isProtected: true, name: i18next.t("ListOfApprovalGroups"), Component: ListApprovalGroups, render: true
    },
    {
        path: "/details-approval-groups", isProtected: true, name: i18next.t("ApprovalGroupDetails"), Component: ApprovalGroupDetails, render: true
    },
    {
        path: "/create-approval-groups", isProtected: true, name: i18next.t("CreateApprovalGroup"), Component: ApprovalGroupDetails, render: true
    },
    {
        path: PR_ROUTES.PURCHASE_REQUISITION_LIST, isProtected: true, name: i18next.t("PurchaseRequisitionList"), Component: PurchaseRequisitionList, render: true
    },
    {
        path: PR_ROUTES.RAISE_REQUISITION, isProtected: true, name: i18next.t("RaiseRequisition"), Component: RaiseRequisition, render: true
    },
    {
        path: DEVELOPER_WR_MODULE_ROUTE.DEVELOP_WORK_REQUEST_DETAILS, isProtected: true, name: i18next.t("DeveloperWorkRequisitionDetails"), Component: DeveloperWorkRequestDetails, render: true
    },
    {
        path: PR_ROUTES.PURCHASE_REQUISITION_DETAILS, isProtected: true, name: i18next.t("PurchaseRequisitionDetails"), Component: PurchaseRequisitionDetails, render: true
    },
    {
        path: PR_ROUTES.EDIT_PURCHASE_REQUISITION_DETAILS, isProtected: true, name: i18next.t("PurchaseRequisitionDetails"), Component: EditPurchaseRequisitionDetails, render: true
    },
    {
        path: PR_ROUTES.VIEW_REQUISITION_DETAILS, isProtected: true, name: i18next.t("PurchaseRequisitionDetails"), Component: PurchaseRequisitionDetails, render: true
    },
    {
        path: PR_ROUTES.EDIT_DRAFT_PURCHASE_REQUISITION, isProtected: true, name: i18next.t("PurchaseRequisitionDetails"), Component: SubmitPurchaseRequisition, render: true
    },
    {
        path: PR_ROUTES.COVERT_PURCHASE_REQUISITION, isProtected: true, name: i18next.t("PendingPurchaserReview"), Component: ConvertPrePurchaseRequisition, render: true
    },
    {
        path: URL_CONFIG.LIST_APPROVAL_MATRIX, isProtected: true, name: i18next.t("ListOfApprovals"), Component: ListApprovalMatrix, render: true
    },
    {
        path: URL_CONFIG.CREATE_APPROVAL_MATRIX, isProtected: true, name: i18next.t("CreateApproval"), Component: ApprovalMatrixDetails, render: true
    },
    {
        path: URL_CONFIG.APPROVAL_MATRIX_DETAILS, isProtected: true, name: i18next.t("ApprovalDetails"), Component: ApprovalMatrixDetails, render: true
    },
    {
        path: DO_ROUTES.DELIVERY_ORDER_LIST, isProtected: true, name: i18next.t("DeliveryOrderList"), Component: DeliveryOrderList, render: true
    },
    {
        path: DO_ROUTES.DELIVERY_ORDER_CREATE, isProtected: true, key: "createDO", name: i18next.t("DeliveryOrderCreate"), Component: DeliveryOrderCreate, render: true
    },
    {
        path: DO_ROUTES.DELIVERY_ORDER_CREATE_DETAILS, isProtected: true, key: "createDODetails", name: i18next.t("DeliveryOrderCreate"), Component: DeliveryOrderDetails, render: true
    },
    {
        path: DO_ROUTES.DELIVERY_ORDER_DETAILS, isProtected: true, name: i18next.t("DeliveryOrderDetails"), Component: DeliveryOrderDetails, render: true
    },
    {
        path: "/features-matrix", isProtected: true, name: i18next.t("ManageFeatureMatrix"), Component: FeaturesMatrix, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.PR_TO_BE_CONVERTED_LIST, isProtected: true, name: i18next.t("PurchaseRequisitionsToBeConvertedList"), Component: PRToBeConvertedList, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.PPR_TO_BE_CONVERTED_LIST, isProtected: true, name: i18next.t("PrePurchaseRequisitionsToBeConvertedList"), Component: PPRToBeConvertedList, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.CONVERT_PR_TO_PO, isProtected: true, name: i18next.t("PRToConvert"), Component: ConvertToPO, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.CONVERT_PPR_TO_PO, isProtected: true, name: i18next.t("PPRToConvert"), Component: ConvertToPO, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.PO_LIST, isProtected: true, name: i18next.t("PurchaseOrdersList"), Component: POList, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.PO_DETAILS, isProtected: true, name: i18next.t("PODetails"), Component: PODetails, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST, isProtected: true, name: i18next.t("DeveloperWorkOrderList"), Component: DeveloperWorkOrderList, render: true
    },
    {
        path: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL, isProtected: true, name: i18next.t("DeveloperWorkOrderDetails"), Component: DeveloperWorkOrderDetails, render: true
    },
    {
        path: DOCUMENT_PREFIX_ROUTES.LIST_DOCUMENT_PREFIXES, isProtected: true, name: i18next.t("ListOfDocumentPrefixes"), Component: ListDocumentPrefixes, render: true
    },
    {
        path: DOCUMENT_PREFIX_ROUTES.DOCUMENT_PREFIX_DETAILS, isProtected: true, name: i18next.t("DocumentPrefixDetails"), Component: DocumentPrefixDetails, render: true
    },
    {
        path: CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_LIST, isProtected: true, name: i18next.t("Contract Request List"), Component: ContractRequestList, render: true
    },
    {
        path: CONTRACT_MODULE_ROUTE.CONTRACT_LIST, isProtected: true, name: i18next.t("Contract List"), Component: ContractList, render: true
    },
    {
        path: CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_FORM, isProtected: true, name: i18next.t("Contract Request"), Component: ContractFormRequest, render: true
    },
    {
        path: CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_FORM_DETAIL, isProtected: true, name: i18next.t("Contract Request Detail"), Component: ContractFormRequest, render: true
    },
    {
        path: CONTRACT_MODULE_ROUTE.CONTRACT_FORM_DETAIL, isProtected: true, name: i18next.t("Contract Detail"), Component: ContractForm, render: true
    },
    {
        path: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS, isProtected: true, name: i18next.t("DeveloperWorkRequisitionList"), Component: ListDWRequistions, render: true
    },
    {
        path: "/category/list", isProtected: true, name: "List of Category", Component: ListCategory, render: true
    },
    {
        path: "/category/details", isProtected: true, name: "Category Details", Component: CategoryDetails, render: true
    },
    {
        path: "/category/create", isProtected: true, name: "Create New Category", Component: CategoryDetails, render: true
    },
    ...ProgressiveClaims,
    ...ManageBankAccountRoutes,
    ...ManageSupplierBankAccountRoutes,
    {
        path: GOODS_RECEIPT_ROUTES.GR_LIST, isProtected: true, name: i18next.t("ReceiptsList"), Component: GRList, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.GR_FROM_DO_LIST, isProtected: true, key: "create-gr-list", name: i18next.t("CreateReceiptFromDO"), Component: GRFromDOList, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.GR_FROM_PO_LIST, isProtected: true, name: i18next.t("CreateReceiptFromPO"), Component: GRFromPOList, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.DO_FLIP_TO_GR, isProtected: true, name: i18next.t("DeliveryOrderDetails"), Component: DOFlipToGR, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.GR_LIST_GR_DETAILS, isProtected: true, name: i18next.t("GoodsReceiptDetails"), Component: GRDetails, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_DO, isProtected: true, key: "create-gr-form-do", name: i18next.t("CreateReceiptFromDO"), Component: CreateGRFromDO, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_PO, isProtected: true, name: i18next.t("CreateReceiptFromPO"), Component: CreateGRFromPO, render: true
    },
    {
        path: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_NON_PO, isProtected: true, name: i18next.t("CreateNonOrderReceipt"), Component: CreateGRFromNonPO, render: true
    },
    {
        path: INVOICE_ROUTES.INVOICE_LIST, isProtected: true, name: i18next.t("InvoicesList"), Component: InvoiceList, render: true
    },
    {
        path: CREDIT_NOTE_ROUTES.CN_LIST, isProtected: true, name: i18next.t("CreditNoteList"), Component: CNList, render: true
    },
    {
        path: INVOICE_ROUTES.CREATE_INV, isProtected: true, name: i18next.t("CreateInvoice"), Component: CreateInvoice, render: true
    },
    {
        path: INVOICE_ROUTES.INV_DETAILS, isProtected: true, name: i18next.t("InvoiceDetails"), Component: InvoiceDetails, render: true
    },
    {
        path: CREDIT_NOTE_ROUTES.CREATE_CN, isProtected: true, name: i18next.t("CreateCreditNote"), Component: CreateCN, render: true
    },
    {
        path: CREDIT_NOTE_ROUTES.CN_DETAILS, isProtected: true, name: i18next.t("CreditNoteDetails"), Component: CNDetails, render: true
    },
    {
        path: INVOICE_ROUTES.INVOICE_PENDING_APPROVAL, isProtected: true, name: i18next.t("InvoicesPendingApproval"), Component: InvoicePendingApprovalList, render: true
    },
    {
        path: INVOICE_ROUTES.INV_PENDING_AP_DETAILS, isProtected: true, name: i18next.t("InvoicePendingApprovalDetails"), Component: InvoicePendingAPDetails
    },
    {
        path: PAYMENT_ROUTE.APPROVED_INVOICE_LIST, isProtected: true, name: i18next.t("ApprovedInvoiceList"), Component: ApprovedInvoiceList
    },
    {
        path: PAYMENT_ROUTE.PAYMENT_SETTING, isProtected: true, name: i18next.t("PaymentSetting"), Component: PaymentSetting
    },
    {
        path: PAYMENT_ROUTE.PENDING_PAYMENT_LIST, isProtected: true, name: i18next.t("PendingPaymentList"), Component: PendingPaymentList
    },
    {
        path: PAYMENT_ROUTE.PAYMENT_DETAILS, isProtected: true, name: i18next.t("PaymentDetails"), Component: PaymentDetails
    },
    {
        path: PAYMENT_ROUTE.PAYMENT_CREATE, isProtected: true, name: i18next.t("CreatePayment"), Component: PaymentDetails
    },
    {
        path: PAYMENT_ROUTE.PAYMENT_LIST, isProtected: true, name: i18next.t("PaymentList"), Component: PaymentList
    },
    {
        path: AP_SPECIALIST_ROUTES.AP_SPECIALIST_LIST, isProtected: true, name: i18next.t("ManageAPSpecialist"), Component: ListAPSpecialist
    },
    {
        path: AP_SPECIALIST_ROUTES.AP_SPECIALIST_CREATE, isProtected: true, name: i18next.t("AddNewAPSpecialistGrouping"), Component: APSpecialistDetails
    },
    {
        path: AP_SPECIALIST_ROUTES.AP_SPECIALIST_DETAILS, isProtected: true, name: i18next.t("APSpecialistDetails"), Component: APSpecialistDetails
    },
    {
        path: PAYMENT_CYCLE_ROUTE.PAYMENT_CYCLES_LIST, isProtected: true, name: i18next.t("ListOfPaymentCycles"), Component: PaymentCyclesList
    },
    {
        path: PAYMENT_CYCLE_ROUTE.UPDATE_PAYMENT_CYCLE, isProtected: true, name: i18next.t("PaymentCycleDetails"), Component: UpdatePaymentCycle
    },
    {
        path: PAYMENT_CYCLE_ROUTE.CREATE_PAYMENT_CYCLE, isProtected: true, name: i18next.t("CreateNewPaymentCycle"), Component: CreatePaymentCycle
    },
    {
        path: PAYMENT_BATCH_ROUTES.APPROVED_PAYMENT_LIST, isProtected: true, name: i18next.t("ApprovedPaymentList"), Component: ApprovedPaymentList
    },
    {
        path: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_LIST, isProtected: true, name: i18next.t("PaymentBatchList"), Component: PaymentBatchList
    },
    {
        path: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_CREATE, isProtected: true, name: i18next.t("CreatePaymentBatch"), Component: PaymentBatchCreate
    },
    {
        path: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_DETAILS, isProtected: true, name: i18next.t("PaymentBatchDetails"), Component: PaymentBatchDetails
    },
    {
        path: MANAGE_ROLES_ROUTES.ROLES_LIST, isProtected: true, name: i18next.t("ListOfRoles"), Component: RolesList
    },
    {
        path: MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE, isProtected: true, name: i18next.t("CreateNewRole"), Component: RoleDetails
    },
    {
        path: MANAGE_ROLES_ROUTES.ROLE_DETAILS, isProtected: true, name: i18next.t("RoleDetails"), Component: RoleDetails
    },
    {
        path: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLES_LIST, isProtected: true, name: "DoxaAdminListOfRoles", Component: DoxaAdminRolesList
    },
    {
        path: DOXA_ADMIN_MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE, isProtected: true, name: "DoxaAdminCreateNewRole", Component: DoxaAdminRoleDetails
    },
    {
        path: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLE_DETAILS, isProtected: true, name: "DoxaAdminRoleDetails", Component: DoxaAdminRoleDetails
    },
    {
        path: RFQ_ROUTES.RFQ_LIST, isProtected: true, name: i18next.t("RFQList"), Component: RFQsList
    },
    {
        path: RFQ_ROUTES.RAISE_RFQ, isProtected: true, name: i18next.t("RaiseRFQ"), Component: RaiseRFQ
    },
    {
        path: RFQ_ROUTES.RFQ_DETAILS, isProtected: true, name: i18next.t("RFQDetails"), Component: RFQDetailsBuyer
    },
    {
        path: RFQ_ROUTES.RFQ_IN_PROCESS, isProtected: true, name: i18next.t("RFQDetails"), Component: RFQDetailsBuyer
    },
    {
        path: RFQ_ROUTES.ISSUE_RFQ, isProtected: true, name: i18next.t("RFQDetails"), Component: RFQDetailsBuyer
    },
    {
        path: RFQ_ROUTES.RFQ_DETAILS_SUPPLIER, isProtected: true, name: i18next.t("RFQDetails"), Component: RFQDetailsSupplier
    },
    {
        path: RFQ_ROUTES.RFQ_DETAILS_UNCONNECTED_SUPPLIER, isProtected: false, name: i18next.t("RFQDetails"), Component: RFQDetailsSupplier
    },
    {
        path: MANAGE_APPROVAL_CONFIG_ROUTES.APPROVAL_CONFIG, isProtected: false, name: i18next.t("ApprovalConfiguration"), Component: ManageApprovalConfig
    },
    {
        path: URL_CONFIG.MANAGE_DOCUMENT_TEMPLATE, name: "Manage Document Template", isProtected: true, Component: ManageDocumentTemplate
    },
];
