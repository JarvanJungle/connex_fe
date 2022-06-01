import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col,
    Button,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import useToast from "routes/hooks/useToast";
import { useHistory, Link } from "react-router-dom";
import { AgGridReact } from "components/agGrid";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import URL_CONFIG from "services/urlConfig";
import {
    convertToLocalTime, defaultColDef
} from "helper/utilities";
import ActionModal from "routes/components/ActionModal";
import _ from "lodash";
import { useCurrentCompany, usePermission } from "routes/hooks";

const ListApprovalMatrix = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const refActiveModal = useRef(null);
    const refDeactivateModal = useRef(null);
    const [companyUuid, setCompanyUuid] = useState("");
    const [gridApi, setGridApi] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [showAction, setShowAction] = useState(false);
    const [actionOne, setActionOne] = useState();
    const [approvals, setApprovals] = useState([]);
    const [selectedApproval, setSelectedApproval] = useState();
    const currentCompany = useCurrentCompany();

    const handleRolePermission = usePermission(FEATURE.APPROVAL_MATRIX);

    const ActionButton = (btnProps) => {
        const { data } = btnProps;
        return (
            <>
                {
                    data.active ? (
                        <span className="activeButton">
                            <i className="fa fa-close" />
                            {` ${t("Deactivate")}`}
                        </span>
                    ) : (
                        <span className="deactiveButton">
                            <i className="fa fa-plus" />
                            {` ${t("Activate")}`}
                        </span>
                    )
                }
            </>
        );
    };

    const columnDefs = (write) => [
        {
            headerName: t("ApprovalCode"),
            field: "approvalCode",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write
        },
        {
            headerName: t("ApprovalName"),
            field: "approvalName"
        },
        {
            headerName: t("NoOfApprovalLevel"),
            field: "noOfApprovalLevels"
        },
        {
            headerName: t("ApprovalMatrixFor"),
            field: "approvalMatrixFor"
        },
        {
            headerName: t("CreatedBy"),
            field: "createdByName"
        },
        {
            headerName: t("UpdatedOn"),
            field: "createdOn",
            valueGetter: (param) => convertToLocalTime(param.data.createdOn)
        },
        {
            headerName: t("IsActive"),
            field: "active",
            width: 120,
            valueGetter: (param) => (param.data.active ? "Yes" : "No")
        },
        {
            headerName: t("Action"),
            field: "action",
            cellRenderer: "actionButton",
            resizable: true,
            filter: false,
            hide: !write
        }
    ];

    useEffect(() => {
        if (!_.isEmpty(currentCompany)) {
            setCompanyUuid(currentCompany.companyUuid);
        }
    }, [currentCompany]);

    const retrieveApprovals = async () => {
        try {
            if (companyUuid) {
                const response = await ApprovalMatrixManagementService
                    .getAllApprovalMatrixList(companyUuid);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    const { data } = response.data;
                    data.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
                    console.log({ data });
                    setApprovals(data);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        retrieveApprovals();
    }, [companyUuid]);

    const onGridReady = (params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
    };

    const onRowDoubleClick = (event) => {
        history.push(`${URL_CONFIG.APPROVAL_MATRIX_DETAILS}?uuid=${event.data.uuid}`);
    };

    const selectCell = (event) => {
        if (event.colDef.headerName === "Action") {
            setSelectedApproval(event.data.uuid);
            setActionOne(true);
            if (event.data.active) {
                refDeactivateModal.current.toggleModal();
            } else {
                refActiveModal.current.toggleModal();
            }
        }
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        if (selectedNodes.length > 0) {
            setShowAction(true);
        } else {
            setShowAction(false);
        }
    };

    const handleAction = async (type) => {
        try {
            setIsLoading(true);
            let data;
            if (actionOne) {
                data = [selectedApproval];
            } else {
                const selectedNotes = gridApi.getSelectedNodes();
                data = selectedNotes.map((node) => node.data.uuid);
            }
            let responses;
            let requests = [];
            switch (type) {
            case "activate":
                requests = data.map((uuid) => ApprovalMatrixManagementService
                    .putActiveApprovalMatrix(companyUuid, uuid));
                responses = await Promise.all(requests);
                break;
            case "deactivate":
                requests = data.map((uuid) => ApprovalMatrixManagementService
                    .putDeActiveApprovalMatrix(companyUuid, uuid));
                responses = await Promise.all(requests);
                break;
            default:
                break;
            }
            setIsLoading(false);
            showToast("success", responses[0].data.data);
            setShowAction(false);
            retrieveApprovals();
        } catch (error) {
            setIsLoading(false);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("List of Approval")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            {
                                showAction && (
                                    <>
                                        <Button
                                            color="primary"
                                            className="mb-2 mr-2 px-3"
                                            onClick={() => {
                                                setActionOne(false);
                                                refActiveModal.current.toggleModal();
                                            }}
                                        >
                                            {t("Activate")}
                                        </Button>
                                        <Button
                                            className="mb-2 mr-2 px-3 button-danger"
                                            onClick={() => {
                                                setActionOne(false);
                                                refDeactivateModal.current.toggleModal();
                                            }}
                                        >
                                            {t("Deactivate")}
                                        </Button>
                                    </>
                                )
                            }
                            {handleRolePermission?.write && (
                                <ButtonToolbar className="ml-auto">
                                    <Link to={URL_CONFIG.CREATE_APPROVAL_MATRIX}>
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <i className="fa fa-plus" />
                                            {` ${t("Create New")}`}
                                        </Button>
                                    </Link>
                                </ButtonToolbar>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={columnDefs(handleRolePermission?.write)}
                                defaultColDef={defaultColDef}
                                rowData={approvals}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                                onSelectionChanged={onSelectionChanged}
                                frameworkComponents={{
                                    actionButton: ActionButton
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
            <ActionModal
                ref={refActiveModal}
                title={t("Activation")}
                body={t("Are you sure you want to activate these approval matrix?")}
                button={t("Activate")}
                color="primary"
                action={() => handleAction("activate")}
            />
            <ActionModal
                ref={refDeactivateModal}
                title={t("Deactivation")}
                body={t("Are you sure you want to deactivate these approval matrix?")}
                button="Deactivate"
                color="danger"
                action={() => handleAction("deactivate")}
            />
        </>
    );
};

export default ListApprovalMatrix;
