import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import Modal from "react-bootstrap/Modal";
import {
    Container,
    ButtonToolbar,
    Button,
    Row,
    Col
} from "components";
import {
    AgGridReact
} from "components/agGrid";
import UOMService from "services/UOMService";
import { CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import UploadButton from "routes/components/UploadButton";
import { useSelector } from "react-redux";
import _ from "lodash";
import { FEATURE } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";

const ListUOM = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const showToast = (type) => toast(type, message);
    const { t } = useTranslation();
    const history = useHistory();
    const [listStates, setListStates] = useState({
        uoms: [],
        gridApi: null,
        gridColumnApi: null,
        companyUuid: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedRow: "",
        activationButtonVisibility: "hidden",
        deactivateOne: true,
        activateOne: true
    });
    const handleRolePermission = usePermission(FEATURE.UOM);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const retrieveUOMs = async () => {
        try {
            if (listStates.gridApi) listStates.gridApi.deselectAll();
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            setListStates((prevStates) => ({
                ...prevStates,
                companyUuid: companyRole.companyUuid
            }));
            const response = await UOMService.getUOMRecords(companyRole.companyUuid);
            if (response.data.status === "OK") {
                setListStates((prevStates) => ({
                    ...prevStates,
                    uoms: response.data.data
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            message = error.response.data.message;
            showToast("error");
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.UOM_DETAILS + event.data.uomCode);
    };

    const handleExport = () => {
        listStates.gridApi.exportDataAsCsv({
            fileName: CSVTemplate.UOM_List_DownloadFileName,
            columnKeys: [
                "uomCode",
                "uomName",
                "description",
                "active"
            ]
        });
    };

    const viewRenderer = (params) => {
        if (params.data.active === true) {
            return "<span style=\"color:red; cursor: pointer;\"><i class=\"fa fa-close\" style=\"font-size:15px;color:red\"></i>&emsp;Deactivate</span>";
        }
        return "<span style=\"color:navy; cursor: pointer; \"><i class=\"fa fa-plus\" style=\"font-size:15px;color:navy\"></i>&emsp;Reactivate</span>";
    };

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true
    };

    const columnDefs = (write) => [
        {
            headerName: t("UOMCode"),
            field: "uomCode",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write,
            valueFormatter: ({ value }) => value.toUpperCase()
        },
        {
            headerName: t("UOMName"),
            field: "uomName",
            valueFormatter: ({ value }) => value.toUpperCase()
        },
        {
            headerName: t("Description"),
            field: "description"
        },
        {
            headerName: t("IsActive"),
            field: "active",
            sort: "desc",
            sortIndex: 1,
            valueGetter: ({ data }) => (data.active ? "Yes" : "No")
        },
        {
            headerName: t("Action"),
            field: "action",
            filter: false,
            cellRenderer: (params) => viewRenderer(params),
            resizable: true,
            hide: !write
        },
        {
            field: "updatedOn",
            sort: "desc",
            sortIndex: 0,
            hide: true
        }
    ];

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setListStates((prevStates) => ({
            ...prevStates,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
    };

    useEffect(() => {
        retrieveUOMs();
    }, []);

    const handleOnDrop = (data) => {
        setListStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        const massUpload = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].data[0] !== "" && !data[i].data[0].includes("UOM Code") && !data[i].data[0].includes(CSVTemplate.UOM_List_Data[0].uomCode)) {
                if (data[i].data[0] && data[i].data[1] && data[i].data[3]) {
                    const isActive = data[i].data[3].toLowerCase() === "yes";
                    const uploadItem = {
                        uomCode: data[i].data[0],
                        uomName: data[i].data[1],
                        description: data[i].data[2],
                        active: isActive
                    };
                    massUpload.push(uploadItem);
                } else {
                    message = CSVTemplate.NeededFields_Error;
                    showToast("error");
                    setListStates((prevStates) => ({
                        ...prevStates,
                        isLoading: false
                    }));
                    return;
                }
            }
        }
        UOMService.postUploadUOMs({ companyUuid: listStates.companyUuid, uoms: massUpload })
            .then((res) => {
                setListStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (res.data.status === "OK") {
                    message = "Mass Upload Done";
                    showToast("success");
                    retrieveUOMs();
                } else {
                    message = res.data.data;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
                setListStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
    };

    const handleOnError = (err) => {
        message = err;
        showToast("error");
    };

    const buttonRef = React.createRef();

    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef.current) {
            buttonRef.current.open(e);
        }
    };

    const handleDeactivationClose = () => setListStates((prevStates) => ({
        ...prevStates,
        deactivationShow: false
    }));
    const handleDeactivationShow = () => setListStates((prevStates) => ({
        ...prevStates,
        deactivationShow: true
    }));
    const handleActivationClose = () => setListStates((prevStates) => ({
        ...prevStates,
        activationShow: false
    }));
    const handleActivationShow = () => setListStates((prevStates) => ({
        ...prevStates,
        activationShow: true
    }));

    const selectCell = (event) => {
        if (event.colDef.headerName === "Action") {
            setListStates((prevStates) => ({
                ...prevStates,
                selectedRow: event.data.uomCode
            }));
            if (event.data.active === true) {
                setListStates((prevStates) => ({
                    ...prevStates,
                    deactivateOne: true
                }));
                handleDeactivationShow();
            } else {
                setListStates((prevStates) => ({
                    ...prevStates,
                    activateOne: true
                }));
                handleActivationShow();
            }
        }
    };

    const deactivating = (selectedData, successMessage) => {
        handleDeactivationClose();
        UOMService
            .putMassDeactivateUOMs(
                { companyUuid: listStates.companyUuid, uomCodeList: selectedData }
            ).then((res) => {
                if (res.data.status === "OK") {
                    message = successMessage;
                    showToast("success");
                    retrieveUOMs();
                } else {
                    message = res.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
            });
    };

    const handleDeactivation = () => {
        deactivating([listStates.selectedRow], "Deactivated");
    };

    const handleMultiDeactivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.uomCode);
        deactivating(selectedData, "Deactivated");
    };

    const activating = (selectedData, successMessage) => {
        handleActivationClose();
        UOMService
            .putMassActivateUOMs({ companyUuid: listStates.companyUuid, uomCodeList: selectedData })
            .then((res) => {
                if (res.data.status === "OK") {
                    message = successMessage;
                    showToast("success");
                    retrieveUOMs();
                } else {
                    message = res.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
            });
    };

    const handleActivation = () => {
        activating([listStates.selectedRow], "Activated");
    };

    const handleMultiActivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.uomCode);
        activating(selectedData, "Activated");
    };

    const onSelectionChanged = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        setListStates((prevStates) => ({
            ...prevStates,
            activationButtonVisibility: selectedNodes.length > 0 ? "visible" : "hidden"
        }));
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListUOM")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            <Button
                                color="primary"
                                className="mb-2 mr-2 px-3"
                                style={{ visibility: listStates.activationButtonVisibility }}
                                onClick={() => {
                                    setListStates((prevStates) => ({
                                        ...prevStates,
                                        activateOne: false
                                    })); handleActivationShow();
                                }}
                            >
                                {t("Activate")}
                            </Button>
                            <Button
                                color="danger"
                                className="mb-2 mr-2 px-3"
                                style={{ visibility: listStates.activationButtonVisibility }}
                                onClick={() => {
                                    setListStates((prevStates) => ({
                                        ...prevStates,
                                        deactivateOne: false
                                    })); handleDeactivationShow();
                                }}
                            >
                                {t("Deactivate")}
                            </Button>
                            <ButtonToolbar className="ml-auto">
                                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                    <i className="fa fa-download" />
                                    {" "}
                                    {t("Download")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <>
                                        <UploadButton
                                            isLoading={listStates.isLoading}
                                            buttonRef={buttonRef}
                                            translation={t}
                                            handleOnDrop={handleOnDrop}
                                            handleOnError={handleOnError}
                                            handleOpenDialog={(e) => buttonRef?.current?.open(e)}
                                        />
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink data={CSVTemplate.UOM_List_Data} headers={CSVTemplate.UOM_List_Headers} filename={CSVTemplate.UOM_List_TemplatesFilename} style={{ color: "white" }}>
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={URL_CONFIG.CREATE_UOM}>
                                            <Button color="primary" className="mb-2 mr-2 px-3">
                                                <i className="fa fa-plus" />
                                                {" "}
                                                {t("Create New")}
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
                                rowData={listStates.uoms}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                                onSelectionChanged={onSelectionChanged}
                            />
                        </div>
                    </Col>
                </Row>
                <CommonConfirmDialog
                    isShow={(listStates.activationShow || listStates.deactivationShow)}
                    onHide={listStates.activationShow ? handleActivationClose
                        : handleDeactivationClose}
                    title={listStates.activationShow ? "Activation" : "Deactivation"}
                    content={`${listStates.activationShow ? `${t("ActivateConfirm")}` : `${t("DeActivateConfirm")}`} ${t("UOM")} ?`}
                    positiveProps={
                        {
                            onPositiveAction: (
                                listStates.activationShow ? (
                                    listStates.activateOne ? handleActivation : handleMultiActivation
                                ) : (listStates.deactivateOne ? handleDeactivation : handleMultiDeactivation)

                            ),
                            contentPositive: listStates.activationShow ? "Activate" : "Deactivate",
                            colorPositive: listStates.activationShow ? "primary" : "danger"
                        }

                    }
                    negativeProps={
                        {
                            onNegativeAction: listStates.activationShow ? handleActivationClose
                                : handleDeactivationClose
                        }
                    }
                />
                <Modal show={listStates.deactivationShow} onHide={handleDeactivationClose} className="modal-outline-danger">
                    <Modal.Header closeButton>
                        <Modal.Title className="text-danger">{t("Deactivation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {`${t("DeActivateConfirm")}?`}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleDeactivationClose} color="link">
                            {t("Cancel")}
                        </Button>
                        <Button variant="primary" onClick={listStates.deactivateOne ? handleDeactivation : handleMultiDeactivation} color="danger">
                            {t("Deactivate")}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={listStates.activationShow} onHide={handleActivationClose} className="modal-outline-primary">
                    <Modal.Header closeButton>
                        <Modal.Title className="text-primary">{t("Activation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {`${t("ActivateConfirm")}?`}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleActivationClose} color="link">
                            {t("Cancel")}
                        </Button>
                        <Button variant="primary" onClick={listStates.activateOne ? handleActivation : handleMultiActivation} color="primary">
                            {t("Activate")}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default ListUOM;
