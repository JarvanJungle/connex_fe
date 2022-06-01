import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import useToast from "routes/hooks/useToast";
import {
    Container,
    Row,
    Col,
    Button,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { AgGridReact } from "components/agGrid";
import ActionModal from "routes/components/ActionModal";
import URL_CONFIG from "services/urlConfig";
import ApprovalGroupService from "services/ApprovalGroupService";
import { convertToLocalTime, defaultColDef } from "helper/utilities";
import _ from "lodash";
import { CSVLink } from "react-csv";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import UploadButton from "routes/components/UploadButton";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

const ListApprovalGroups = () => {
    const { t } = useTranslation();
    const refActiveModal = useRef(null);
    const refDeactivateModal = useRef(null);
    const showToast = useToast();
    const history = useHistory();
    const [companyUuid, setCompanyUuid] = useState("");
    const [gridApi, setGridApi] = useState();
    const [showAction, setShowAction] = useState(false);
    const [actionOne, setActionOne] = useState();
    const [selectedGroup, setSelectedGroup] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const uploadBtnRef = useRef(null);
    const handleRolePermission = usePermission(FEATURE.APPROVAL_MATRIX);
    const currentCompany = useCurrentCompany();

    const columnDefs = (write) => [
        {
            headerName: t("ApprovalGroupName"),
            field: "groupName",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write,
            width: 250
        },
        {
            headerName: t("Approver"),
            field: "groupUserList",
            width: 300,
            cellRenderer: (params) => {
                const { value } = params;
                if (value) return value.map((user) => user.name).join(", ");
                return "";
            },
            filter: "agTextColumnFilter",
            filterParams: {
                valueGetter: (params) => params.data.groupUserList.map((user) => user.name).join(", ")
            }
        },
        {
            headerName: t("Remarks"),
            field: "groupDescription",
            width: 350
        },
        {
            headerName: t("CreatedBy"),
            field: "createdByName",
            width: 200
        },
        {
            headerName: t("CreatedOn"),
            field: "createdOn",
            width: 200,
            sort: "desc",
            valueFormatter: ({ value }) => convertToLocalTime(value)
        },
        {
            headerName: t("IsActive"),
            field: "active",
            width: 150,
            filter: false,
            valueFormatter: ({ value }) => (value ? "Yes" : "No")
        },
        {
            headerName: t("Action"),
            field: "action",
            width: 150,
            cellRenderer: "actionButton",
            filter: false,
            resizable: true,
            hide: !write
        }
    ];

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
    useEffect(() => {
        if (!_.isEmpty(currentCompany)) {
            setCompanyUuid(currentCompany.companyUuid);
        }
    }, [currentCompany]);

    const retrieveAppovalGroups = async () => {
        try {
            if (companyUuid) {
                const response = await ApprovalGroupService.getAllGroups(companyUuid);
                if (response.data.status === "OK") {
                    gridApi.setRowData(response.data.data);
                    setShowAction(false);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (companyUuid && gridApi) {
            retrieveAppovalGroups();
        }
    }, [companyUuid, gridApi]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.APPROVAL_GROUPS_DETAILS + event.data.uuid);
    };

    const selectCell = (event) => {
        if (event.colDef.headerName === "Action") {
            setSelectedGroup(event.data.uuid);
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
                data = [selectedGroup];
            } else {
                const selectedNotes = gridApi.getSelectedNodes();
                data = selectedNotes.map((node) => node.data.uuid);
            }
            let response;
            switch (type) {
            case "activate":
                response = await ApprovalGroupService.putActiveGroups(companyUuid, data);
                break;
            case "deactivate":
                response = await ApprovalGroupService.putDeActiveGroups(companyUuid, data);
                break;
            default:
                break;
            }
            if (response && response.data.status === "OK") {
                setIsLoading(false);
                showToast("success", response.data.message);
                retrieveAppovalGroups();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            setIsLoading(false);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleExport = () => {
        gridApi.exportDataAsCsv(
            {
                fileName: CSVTemplate.ApprovalGroup_List_DownloadFileName,
                columnKeys: [
                    "groupName",
                    "groupUserList",
                    "groupDescription",
                    "createdByName",
                    "createdOn",
                    "active"
                ],
                processCellCallback: (cell) => {
                    if (cell.column?.colId === "active") {
                        return cell.value ? "Yes" : "No";
                    }
                    if (cell.column?.colId === "groupUserList") {
                        return cell?.value?.map((u) => u.name)?.join(",");
                    }
                    return cell.value;
                }
            }
        );
    };

    const handleUpload = async (csvData = []) => {
        // Remove first element - header element
        setIsLoading(true);
        try {
            csvData.shift();
            const payload = csvData
                // Filter valid row: Payment Cycle Code, Payment Cycle Date and Is active required
                .filter(({ data }) => data[0] && data[1])
                .map(({ data }) => ({
                    groupName: data[0],
                    groupUserList: data[1].split(",").map((u) => ({ userEmail: u.trim() })),
                    groupDescription: data[2],
                    active: data[3] === "Yes"
                }));
            if (payload.length === 0) throw Error("No valid row to upload");
            // Mass upload API here
            await ApprovalGroupService.massUpload(payload);
            showToast("success", "Upload completed");
            await retrieveAppovalGroups();
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
        setIsLoading(false);
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListOfApprovalGroups")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            {
                                showAction && (
                                    <ButtonToolbar>
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
                                            color="danger"
                                            className="mb-2 mr-2 px-3"
                                            onClick={() => {
                                                setActionOne(false);
                                                refDeactivateModal.current.toggleModal();
                                            }}
                                        >
                                            {t("Deactivate")}
                                        </Button>
                                    </ButtonToolbar>
                                )
                            }
                            <ButtonToolbar className="ml-auto">
                                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                    <i className="fa fa-download" />
                                    {` ${t("Download")}`}
                                </Button>
                                {handleRolePermission?.write && (
                                    <>
                                        <UploadButton
                                            isLoading={isLoading}
                                            buttonRef={uploadBtnRef}
                                            translation={t}
                                            handleOnDrop={handleUpload}
                                            handleOnError={(e) => showToast("error", e)}
                                            handleOpenDialog={(e) => uploadBtnRef?.current?.open(e)}
                                        />
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink
                                                data={CSVTemplate.ApprovalGroup_List_Data}
                                                headers={CSVTemplate.ApprovalGroup_List_Headers}
                                                filename={CSVTemplate.ApprovalGroup_List_TemplatesFilename}
                                                style={{ color: "white" }}
                                            >
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={URL_CONFIG.CREATE_APPROVAL_GROUPS}>
                                            <Button color="primary" className="mb-2 mr-2 px-3">
                                                <i className="fa fa-plus" />
                                                {` ${t("Create New")}`}
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </ButtonToolbar>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={columnDefs(handleRolePermission?.write)}
                                defaultColDef={defaultColDef}
                                rowData={[]}
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
                body={t("Are you sure you want to activate these approval groups?")}
                button={t("Activate")}
                color="primary"
                action={() => handleAction("activate")}
            />
            <ActionModal
                ref={refDeactivateModal}
                title={t("Deactivation")}
                body={t("Are you sure you want to deactivate these approval groups?")}
                button="Deactivate"
                color="danger"
                action={() => handleAction("deactivate")}
            />
        </>
    );
};

export default ListApprovalGroups;
