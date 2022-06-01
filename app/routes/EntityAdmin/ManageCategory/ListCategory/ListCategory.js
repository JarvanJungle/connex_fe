import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import CSVHelper from "helper/CSVHelper";
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
import { isNullOrUndefinedOrEmpty } from "helper/utilities";

import UploadButton from "routes/components/UploadButton";
import CategoryService from "services/CategoryService/CategoryService";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import _ from "lodash";
import CATEGORY_ROUTES from "../route";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

const ListCategory = () => {
    const showToast = useToast();

    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const { t } = useTranslation();
    const history = useHistory();
    const [listStates, setListStates] = useState({
        listCategory: [],
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
    const [isLoading, setIsLoading] = useState(false);
    const handleRolePermission = usePermission(FEATURE.CATEGORY);

    const retrieveListCategory = async () => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
            try {
                if (listStates.gridApi) listStates.gridApi.deselectAll();
                setListStates((prevStates) => ({
                    ...prevStates,
                    companyUuid: currentCompanyUUID
                }));
                const responseCategory = await CategoryService.getListCategory(currentCompanyUUID);
                // get List Category
                if (responseCategory.data.status === "OK") {
                    const listCategory = responseCategory.data.data;
                    setListStates((prevStates) => ({
                        ...prevStates,
                        listCategory
                    }));
                } else {
                    throw new Error(responseCategory.data.message);
                }
            } catch (error) {
                showToast("error", error.response.data.message || error?.message);
            }
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(
            `${CATEGORY_ROUTES.CATEGORY_DETAILS}?uuid=${event.data.uuid}`, { category: event.data }
        );
    };

    const handleExport = () => {
        listStates.gridApi
            .exportDataAsCsv({
                columnKeys: ["categoryName", "categoryDescription", "active"],
                fileName: CSVTemplate.Category_List_DownloadFileName
            });
    };

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true
    };

    const viewRenderer = (params) => {
        if (params.data.active) {
            return "<span style=\"color:red; cursor: pointer;\"><i class=\"fa fa-close\" style=\"font-size:15px;color:red\"></i>&emsp;Deactivate</span>";
        }
        return "<span style=\"color:navy; cursor: pointer; \"><i class=\"fa fa-plus\" style=\"font-size:15px;color:navy\"></i>&emsp;Activate</span>";
    };

    const columnDefs = (write) => [
        {
            headerName: t("Category Name"),
            field: "categoryName",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write
        },
        {
            headerName: t("Category Description"),
            field: "categoryDescription"
        },
        {
            headerName: t("Category Uuid"),
            field: "uuid",
            hide: true
        },
        {
            headerName: t("IsActive"),
            field: "active",
            sort: "desc",
            sortIndex: 1,
            valueGetter: ({ data }) => (data.active ? "Yes" : "No")
        },
        {
            field: "updatedOn",
            hide: true,
            sort: "desc",
            sortIndex: 0
        },
        {
            headerName: t("Action"),
            field: "action",
            filter: false,
            cellRenderer: (params) => viewRenderer(params),
            hide: !write
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
        retrieveListCategory();
    }, [userPermission]);

    const handleOnDrop = (data = []) => {
        setIsLoading(true);
        const massUpload = [];
        try {
            for (let i = 0; i < data.length; i++) {
                if (data[i].data[0] !== "" && !data[i].data[0].includes("Category Name")) {
                    const validationResult = CSVHelper.validateCSV(data, ["Category Name", "Is Active"]);
                    if (validationResult.missingField) {
                        throw new Error(`Validate Error: Please select valid  ${validationResult.missingField}`);
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplate.NeededFields_Error);
                    }
                    const isActive = data[i].data[2].toLowerCase() === "yes";
                    const uploadItem = {
                        companyUuid: listStates.companyUuid,
                        categoryName: data[i].data[0],
                        categoryDescription: data[i].data[1],
                        active: isActive
                    };
                    massUpload.push(uploadItem);
                }
            }
        } catch (error) {
            showToast("error", error?.message);
            setIsLoading(false);
            return;
        }
        const payload = {
            companyUuid: listStates.companyUuid,
            categoryList: massUpload
        };

        CategoryService.postMassUploadCategory(payload).then(() => {
            setIsLoading(false);
            showToast("success", "Mass Upload Done");
            retrieveListCategory();
        }).catch((error) => {
            showToast("error", error?.response?.data?.message || error?.message);
            setIsLoading(false);
        });
    };

    const handleOnError = (err) => {
        showToast("error", err);
    };

    const buttonRef = React.createRef();

    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
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
                selectedRow: event.data.uuid
            }));
            if (event.data.active) {
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

    const deactivating = (uuidList, successMessage) => {
        handleDeactivationClose();
        CategoryService.deactivate({ companyUuid: listStates.companyUuid, listCategory: uuidList })
            .then((res) => {
                showToast("success", successMessage);
                retrieveListCategory();
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error", error?.response?.data?.message || error.message);
            });
    };

    const handleDeactivation = () => {
        deactivating([listStates.selectedRow], "Category Deactivated");
    };

    const handleMultiDeactivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.uuid);
        deactivating(selectedData, "Category Deactivated");
    };

    const activating = (uuidList, successMessage) => {
        handleActivationClose();
        // Api Active
        CategoryService.activate({ companyUuid: listStates.companyUuid, listCategory: uuidList })
            .then(() => {
                showToast("success", successMessage);
                retrieveListCategory();
            }).catch((error) => {
                showToast("error", error?.response?.data?.message || error?.message);
            });
    };

    const handleActivation = () => {
        activating([listStates.selectedRow], "Category Activated");
    };

    const handleMultiActivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.uuid);
        activating(selectedData, "Category Activated");
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
                            title={t("List of Category")}
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
                                            buttonRef={buttonRef}
                                            handleOnDrop={handleOnDrop}
                                            isLoading={isLoading}
                                            handleOnError={handleOnError}
                                            translation={t}
                                            handleOpenDialog={handleOpenDialog}
                                        />
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink data={CSVTemplate.Category_List_Data} headers={CSVTemplate.Category_List_Headers} filename={CSVTemplate.Category_List_TemplatesFilename} style={{ color: "white" }}>
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={CATEGORY_ROUTES.CREATE_CATEGORY}>
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
                                rowData={listStates.listCategory}
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
                <Modal show={listStates.deactivationShow} onHide={handleDeactivationClose}>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-danger">{t("Deactivation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {t("Are you sure you want to deactivate")}
                        ?
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
                <Modal show={listStates.activationShow} onHide={handleActivationClose}>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-primary">{t("Activation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {t("Are you sure you want to activate")}
                        ?
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

export default ListCategory;
