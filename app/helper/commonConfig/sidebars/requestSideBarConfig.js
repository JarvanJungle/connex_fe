import URL_CONFIG from "services/urlConfig";
import { PR_ROUTES } from "routes/P2P/PurchaseRequest";

const RequisitionSideBar = [
    {
        id: "pre-requisitions",
        icon: "fa fa-fw fa-calendar-check-o",
        title: "Pre-Requisitions",
        path: "",
        children: [
            {
                id: "raise-pre-requisitions",
                title: "Raise Pre-Requisition",
                path: URL_CONFIG.PPR_ROUTING.RAISE_PRE_REQUISITIONS,
                children: []
            },
            // {
            //     id: "rental-pre-requisitions-list",
            //     title: "Rental Pre-Requisitions List",
            //     path: "",
            //     children: []
            // },
            {
                id: "purchase-pre-requisitions-list",
                title: "Purchase Pre-Requisitions List",
                path: URL_CONFIG.PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST,
                children: []
            }
        ]
    },
    {
        id: "requisitions",
        icon: "fa fa-fw fa-calendar-minus-o",
        title: "Requisitions",
        path: "",
        children: [
            {
                id: "raise-requisition",
                title: "Raise Requisition",
                path: PR_ROUTES.RAISE_REQUISITION,
                children: []
            },
            {
                id: "PR-list",
                title: "PR List",
                path: PR_ROUTES.PURCHASE_REQUISITION_LIST,
                children: []
            }
            // {
            //     id: "LR-list",
            //     title: "LR List",
            //     path: "",
            //     children: []
            // },
            // {
            //     id: "WR-list",
            //     title: "WR List",
            //     path: "",
            //     children: []
            // },
            // {
            //     id: "BC-list",
            //     title: "BC List",
            //     path: "",
            //     children: []
            // },
            // {
            //     id: "VR-list",
            //     title: "VR List",
            //     path: "",
            //     children: []
            // }
        ]
    }

];

export default RequisitionSideBar;
