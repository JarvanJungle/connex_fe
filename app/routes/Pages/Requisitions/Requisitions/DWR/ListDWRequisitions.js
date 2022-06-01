import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import DeveloperWorkRequestService from "services/DeveloperWorkRequestService/DeveloperWorkRequestService";
import {
    Container,
    Row,
    Col,
    Button,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { AgGridReact } from "components/agGrid";
import { ToastContainer } from "react-toastify";
import { defaultColDef } from "helper/utilities";
import { useHistory } from "react-router-dom";
import PURCHASE_ORDER_ROUTES from "routes/P2P/PurchaseRequest/route";

const ListDWRequistions = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [gridApi, setGridApi] = useState();
    const [requisitionList, setRequisitionList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const showToast = useToast();
    const [companyUuid, setCompanyUuid] = useState("");
    const authReducer = useSelector((state) => state.authReducer);

    const columnDefs = [
        {
            headerName: t("DeveloperWorkRequisitionNo"),
            field: "dwrNumber"
        },
        {
            headerName: t("WorkRequisitionDate"),
            field: "dwrDate"
        },
        {
            headerName: t("Status"),
            field: "dwrStatus"
        },
        /*         {
            headerName: t("Project"),
            field: "projectName"
        },
        {
            headerName: t("ProjectTrade"),
            field: "projectTrade"
        }, */
        {
            headerName: t("MainContractorName"),
            field: "mainContractorName"
        },
        {
            headerName: t("WorkRequisitionTitle"),
            field: "workRequisitionTitle"
        },
        {
            headerName: t("ApprovalRoute"),
            field: "approvalRouteName"
        },
        {
            headerName: t("ApprovalSequence"),
            field: "approvalRouteSequence"
        },
        {
            headerName: t("NextApprover"),
            field: "nextApprover"
        },
        {
            headerName: t("UpdatedBy"),
            field: "updatedByName"
        },
        {
            headerName: t("UpdatedOn"),
            field: "updatedDate"
        },
        /* {
            headerName: t("SubmittedBy"),
            field: "submittedBy"
        }, */
        {
            headerName: t("SubmittedOn"),
            field: "submittedDate"
        },
        {
            headerName: t("WorkRequisitionReference"),
            field: "workReferenceNumber"
        },
        {
            headerName: t("MainContractorCode"),
            field: "mainContractorCode"
        }
    ];

    useEffect(() => {
        if (authReducer && !_.isEmpty(authReducer.userDetails)) {
            const companyDetails = authReducer.userDetails.companies[0];
            setCompanyUuid(companyDetails.companyUuid);
        }
    }, [authReducer]);

    const retrieveDWRequisitionList = async () => {
        if (companyUuid) {
            try {
                const response = await DeveloperWorkRequestService.getRequisitionList(companyUuid);
                const workRequestList = await response.data.data;
                setRequisitionList(workRequestList);
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    useEffect(() => {
        retrieveDWRequisitionList();
    }, [companyUuid]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const onRowDoubleClick = (event) => {
        const { data } = event;
        history.push({
            pathname: PURCHASE_ORDER_ROUTES.DEVELOP_WORK_REQUEST_DETAILS,
            search: `?uuid=${data.dwrUuid}`,
            state: { data }
        });
    };

    const selectCell = (event) => {

    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("DeveloperWorkRequisitionList")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={requisitionList}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ListDWRequistions;
