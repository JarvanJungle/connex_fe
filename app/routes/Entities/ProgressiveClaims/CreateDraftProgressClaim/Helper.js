import * as Yup from "yup";
import i18next from "i18next";
import {
    formatDateTime,
    textCustomStatusComparator
} from "../../../P2P/Invoice/helper/utilities";

export const CreateDraftProgressClaimColumnDefs = [
    {
        headerName: i18next.t("Developer Work Order No."),
        field: "dwoNumber",
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true
    },
    {
        headerName: i18next.t("Status"),
        field: "dwoStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        filterParams: {
            textCustomComparator: textCustomStatusComparator
        },
        filter: "agTextColumnFilter",
        minWidth: 150
    },
    {
        headerName: i18next.t("Vendor Ack"),
        field: "vendorAck",
        minWidth: 200
    },
    {
        headerName: i18next.t("Vendor Name"),
        field: "vendorName",
        minWidth: 200
    },
    {
        headerName: i18next.t("Work Order Title"),
        field: "workOrderTitle",
        minWidth: 200
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        minWidth: 200
    },
    {
        headerName: i18next.t("Issued By"),
        field: "issuedBy",
        minWidth: 200
    },
    {
        headerName: i18next.t("Issued Date"),
        field: "issuedDate",
        cellRenderer: formatDateTime,
        minWidth: 200
    },
    {
        headerName: i18next.t("Updated On"),
        field: "updatedDate",
        cellRenderer: formatDateTime,
        minWidth: 200
    }
];

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

export const mockData = [
    {
        dwoNumber: "DVWO-000000010",
        dwoStatus: "ISSUED",
        vendorAck: "ACKNOWLEDGED",
        vendorName: "Norking Pte Ltd UAT",
        workOrderTitle: "WR Title Test Payment 05",
        projectCode: "SITP2",
        issuedBy: "Madelene",
        issuedDate: "30/06/2021",
        updatedDate: "30/06/2021"
    },
    {
        dwoNumber: "DVWO-000000020",
        dwoStatus: "IN_PROGRESS",
        vendorAck: "ACKNOWLEDGED",
        vendorName: "Norking Pte Ltd UAT",
        workOrderTitle: "WR Title Test Payment 05",
        projectCode: "SITP2",
        issuedBy: "Madelene",
        issuedDate: "30/06/2021",
        updatedDate: "30/06/2021"
    },
    {
        dwoNumber: "DVWO-000000030",
        dwoStatus: "IN_PROGRESS",
        vendorAck: "ACKNOWLEDGED",
        vendorName: "Norking Pte Ltd UAT",
        workOrderTitle: "WR Title Test Payment 05",
        projectCode: "SITP2",
        issuedBy: "Madelene",
        issuedDate: "30/06/2021",
        updatedDate: "30/06/2021"
    }
];

export const initialValues = {
    developerWorkOrderNo: "",
    status: "",
    currency: "",
    project: "",
    vendorCode: "",
    vendorName: "",
    contactName: "",
    contactEmail: "",
    contactNumber: "",
    country: "",
    companyRegNo: "",
    contactType: "",
    workOrderTitle: "",
    workOrderDate: "",
    dateOfConfirmation: "",
    remark: "",
    originalContactSum: "",
    BQContingencySum: "",
    remeasuredContactSum: "",
    agreedVariationOrderSum: "",
    adjustedContractSum: "",
    includeSubconVariationForRetentionCap: "",
    retention: "",
    retentionCappedAt: "",
    contractType: "",
    dwoDate: "",
    remarks: "",
    dwoNumber: "",
    dwoStatus: "",
    currencyCode: "",
    projectCode: "",
    countryCode: "",
    companyRegistrationNo: "",
    originalContractSum: "",
    bqContingencySum: "",
    remeasuredContractSum: "",
    includeVariation: "",
    retentionPercentage: "",
    retentionCappedPercentage: "",
    retentionAmountCappedAt: ""
};

export const validationSchema = (t) => (Yup.object().shape({
    // projectCode: Yup.string()
    //     .test(
    //         "projectRequired",
    //         t("PleaseSelectValidProject"),
    //         (value, testContext) => {
    //             const { parent } = testContext;
    //             return ((value && parent.natureOfRequisition) || (!value && !parent.natureOfRequisition));
    //         }
    //     ),
    // requisitionType: Yup.string()
    //     .required(t("PleaseSelectValidTypeOfRequisition")),
    // pprTitle: Yup.string()
    //     .required(t("PleaseEnterValidPPRTitle")),
    // procurementType: Yup.string()
    //     .required(t("PleaseSelectValidProcurementType")),
    // approvalRoute: Yup.string()
    //     .required(t("PleaseSelectValidApprovalRoute")),
    // deliveryAddress: Yup.string()
    //     .required(t("PleaseSelectValidDeliveryAddress")),
    // deliveryDate: Yup.string()
    //     .required(t("PleaseSelectValidDeliveryDate")),
    // currencyCode: Yup.string()
    //     .required(t("PleaseSelectValidCurrency"))
}));

export const workSpaceColumnDefs = (t) => ([
    {
        headerName: t("Work Code"),
        field: "workCode"
    },
    {
        headerName: t("Description"),
        field: "description"
    },
    {
        headerName: t("Forecasted Amount"),
        field: "forecastedAmount"
    },
    {
        headerName: t("UOM"),
        field: "UOM"
    },
    {
        headerName: t("Weight Age"),
        field: "weightAge"
    },
    {
        headerName: t("Quantity"),
        field: "quantity"
    },
    {
        headerName: t("Unit Price"),
        field: "unitPrice"
    },
    {
        headerName: t("Total Amount"),
        field: "totalAmount"
    },
    {
        headerName: t("Remark"),
        field: "remark"
    }
]);

export const workSpaceMockData = [
    {
        workCode: "STR00004",
        description: "REBAR",
        forecastedAmount: "SGD 55.000,00",
        UOM: "",
        weightAge: "100%",
        quantity: "",
        unitPrice: "",
        totalAmount: "SGD 55.000,00",
        remark: ""
    },
    {
        workCode: "STR00004",
        description: "REBAR",
        forecastedAmount: "SGD 55.000,00",
        UOM: "",
        weightAge: "100%",
        quantity: "",
        unitPrice: "",
        totalAmount: "SGD 55.000,00",
        remark: ""
    },
    {
        workCode: "STR00004",
        description: "REBAR",
        forecastedAmount: "SGD 55.000,00",
        UOM: "",
        weightAge: "100%",
        quantity: "",
        unitPrice: "",
        totalAmount: "SGD 55.000,00",
        remark: ""
    }
];

export const PAGE_STAGE = {
    DETAIL: "DETAIL",
    CREATE: "CREATE",
    CREATE_CLAIMS: "CREATE_CLAIMS",
    EDIT: "EDIT"
};
