import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import _ from "lodash";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { DWO_STATUSES, TOAST_PROPS } from "helper/constantsDefined";
import i18next from "i18next";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container,
    Row,
    Col
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { formatDateString, getCurrentCompanyUUIDByStore } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { SET_IS_BUYER } from "actions/types/permissionTypes";
import PURCHASE_ORDER_ROUTES from "../route";

const textCustomStatusComparator = (filter, value, filterText) => {
    const filterTextLowerCase = filterText.toLowerCase().replaceAll(" ", "_");
    const valueLowerCase = value.toString().toLowerCase();
    switch (filter) {
    case "contains":
        return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
    case "notContains":
        return valueLowerCase.indexOf(filterTextLowerCase) === -1;
    case "equals":
        return valueLowerCase === filterTextLowerCase;
    case "notEqual":
        return valueLowerCase != filterTextLowerCase;
    case "startsWith":
        return valueLowerCase.indexOf(filterTextLowerCase) === 0;
    case "endsWith": {
        const index = valueLowerCase.lastIndexOf(filterTextLowerCase);
        const endNum = valueLowerCase.length - filterTextLowerCase.length;
        return index >= 0 && index === endNum;
    }
    default:
        // should never happen
        console.warn(`invalid filter type ${filter}`);
        return false;
    }
};
const DeveloperWorkOrderList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();

    const permissionReducer = useSelector((state) => state.permissionReducer);

    const [workOrderListState, setWorkOrderState] = useState({
        loading: false,
        gridApi: null,
        workOrderList: []
    });
    const [isBuyer, setIsBuyer] = useState(true);

    const ColDefs = [
        {
            headerName: i18next.t("DeveloperWorkOrderNo."),
            field: "dwoNumber",
            minWidth: 220,
            sort: "desc"
        },
        {
            headerName: i18next.t("DeveloperWorkRequisitionNo"),
            field: "dwrNumber",
            minWidth: 240
        },

        {
            headerName: i18next.t("Status"),
            field: "dwoStatus",
            cellRenderer: (params) => {
                const { value } = params;
                if (value) return value.replaceAll("_", " ");
                return value;
            },
            filterParams: {
                textCustomComparator: textCustomStatusComparator
            },
            filter: "agTextColumnFilter",
            minWidth: 200
        },
        {
            headerName: i18next.t("VendorAck"),
            field: "vendorAckStatus",
            cellRenderer: (params) => {
                const { value } = params;
                if (value) return value.replaceAll("_", " ");
                return value;
            },
            filterParams: {
                textCustomComparator: textCustomStatusComparator
            },
            filter: "agTextColumnFilter",
            minWidth: 220
        },
        {
            headerName: i18next.t("VendorName"),
            field: "vendorName",
            minWidth: 220
        },
        {
            headerName: i18next.t("Project"),
            field: "projectCode",
            minWidth: 220
        },
        {
            headerName: i18next.t("ProjectTrade"),
            field: "tradeCode",
            minWidth: 150
        },
        {
            headerName: i18next.t("WorkOrderTitle"),
            field: "workOrderTitle",
            minWidth: 220
        },
        {
            headerName: i18next.t("WorkOrderDate"),
            field: "dwoDate",
            cellRenderer: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYY)

        },
        {
            headerName: i18next.t("IssuedBy"),
            field: "issuerName"
        },
        {
            headerName: i18next.t("IssuedOn"),
            field: "issuedDate",
            cellRenderer: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYhhmmss)
        },
        {
            headerName: i18next.t("Requester"),
            field: "submitterName",
            minWidth: 120

        },
        {
            headerName: i18next.t("CreatedDate"),
            field: "submittedDate",
            cellRenderer: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYhhmmss)
        },
        {
            headerName: i18next.t("WorkOrderReferenceNo."),
            field: "workReferenceNumber"
        },
        {
            headerName: i18next.t("VendorCode"),
            field: "vendorCode"
        }
    ];

    const ColDefsForSupplier = [
        {
            headerName: i18next.t("DeveloperWorkOrderNo."),
            field: "dwoNumber",
            minWidth: 220,
            sort: "desc"
        },

        {
            headerName: i18next.t("Status"),
            field: "dwoStatus",
            cellRenderer: (params) => {
                const { value } = params;
                if (value) return value.replaceAll("_", " ");
                return value;
            },
            filterParams: {
                textCustomComparator: textCustomStatusComparator
            },
            filter: "agTextColumnFilter",
            minWidth: 200
        },
        {
            headerName: i18next.t("VendorAck"),
            field: "vendorAckStatus",
            cellRenderer: (params) => {
                const { value } = params;
                if (value) return value.replaceAll("_", " ");
                return value;
            },
            filterParams: {
                textCustomComparator: textCustomStatusComparator
            },
            filter: "agTextColumnFilter",
            minWidth: 220
        },
        {
            headerName: i18next.t("VendorName"),
            field: "vendorName",
            minWidth: 220
        },
        {
            headerName: i18next.t("WorkOrderTitle"),
            field: "workOrderTitle",
            minWidth: 220
        },
        {
            headerName: i18next.t("Project"),
            field: "projectCode",
            minWidth: 220
        },
        {
            headerName: i18next.t("IssuedBy"),
            field: "issuerName"
        },
        {
            headerName: i18next.t("IssuedOn"),
            field: "issuedDate",
            cellRenderer: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYhhmmss)
        },
        {
            headerName: i18next.t("UpdatedOn"),
            field: "updatedDate",
            cellRenderer: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYhhmmss)
        }

    ];

    const getData = async (isBuyerInit, companyUuid) => {
        const { gridApi } = workOrderListState;
        if (!gridApi) return;
        gridApi.showLoadingOverlay();
        try {
            const response = await PurchaseOrderService.getWorkOrderList(isBuyerInit, companyUuid);
            gridApi.hideOverlay();
            gridApi.showNoRowsOverlay();
            if (response.data.status === RESPONSE_STATUS.OK) {
                let workOrderList = response.data.data;
                if (!isBuyerInit) {
                    workOrderList = workOrderList.filter((item) => (
                        item.dwoStatus === DWO_STATUSES.IN_PROGRESS
                        || item.dwoStatus === DWO_STATUSES.ISSUED
                    ));
                }
                setWorkOrderState((prevStates) => ({
                    ...prevStates,
                    workOrderList
                }));
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        setWorkOrderState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        if (permissionReducer && permissionReducer.currentCompany) {
            const currentCompanyUUID = getCurrentCompanyUUIDByStore(permissionReducer);
            setIsBuyer(permissionReducer.isBuyer);
            if (currentCompanyUUID) {
                getData(permissionReducer.isBuyer, currentCompanyUUID);
            }
        }
    }, [workOrderListState.gridApi, permissionReducer]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        history.push({
            pathname: PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL,
            search: `?uuid=${data.dwoUuid}`,
            state: { data }
        });
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("DeveloperWorkOrderList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={isBuyer ? ColDefs : ColDefsForSupplier}
                        onGridReady={onGridReady}
                        rowData={workOrderListState.workOrderList}
                        gridHeight={576}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default DeveloperWorkOrderList;
