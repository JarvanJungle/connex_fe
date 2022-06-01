import React, {
    useState, useEffect, useRef, forwardRef, useImperativeHandle
} from "react";
import { AgGridTable } from "routes/components";
import ManageRolesService from "services/ManageRolesService/ManageRolesService";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col, Button
} from "components";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import ActionModal from "routes/components/ActionModal";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { useSelector } from "react-redux";
import IconButton from "@material-ui/core/IconButton";
import DOXA_ADMIN_MANAGE_ROLES_ROUTES from "../routes";
import RolesListColDefs from "../ColumnDefs";

export default function DoxaAdminRolesList() {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState(null);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [rolesList, setRolesList] = useState([]);
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [singleDeleteUuid, setSingleDeleteUuid] = useState(null);
    const modalRef = useRef();

    const getData = async () => {
        gridApi.showLoadingOverlay();
        try {
            const response = await ManageRolesService.getDefaultRolesList();
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                setRolesList(response.data.data);

                if (response.data.data.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
            gridApi.showNoRowsOverlay();
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setGridApi(params.api);
    };

    useEffect(() => {
        if (gridApi) {
            getData();
        }
    }, [gridApi]);

    const onDeleteRecordsPressHandler = async () => {
        const listData = singleDeleteUuid
            ? [singleDeleteUuid]
            : selectedRecords.map((item) => item.data.uuid);
        try {
            await Promise.all(listData.map(ManageRolesService.deleteRole));
            showToast("success", "Role deleted successfully");
            getData(getCurrentCompanyUUIDByStore(permissionReducer));
            setSelectedRecords([]);
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
    };

    const onCreateNewPressHandler = () => {
        history.push(DOXA_ADMIN_MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE);
    };

    const onRowDoubleClicked = (event) => {
        history.push({
            pathname: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLE_DETAILS,
            search: `?uuid=${event.data.uuid}`
        });
    };

    const onSingleDelete = (uuid) => () => {
        setSingleDeleteUuid(uuid);
        modalRef?.current?.toggleModal();
    };

    const actionRender = forwardRef(({ data }, ref) => {
        useImperativeHandle(ref, () => ({
            getReactContainerStyle() {
                return { width: "100%" };
            }
        }));

        return (
            <>
                <Row className="mx-0 justify-content-between">
                    {/* <Link
                        to={{
                            pathname: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLE_DETAILS,
                            search: `?uuid=${data?.uuid}`
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => { }}
                        >
                            <i className="fa fa-pencil" />
                        </IconButton>
                    </Link> */}
                    <Link
                        to={{
                            pathname: DOXA_ADMIN_MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE,
                            search: `?uuid=${data?.uuid}`
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => { }}
                        >
                            <i className="fa fa-files-o" />
                        </IconButton>
                    </Link>
                    {/* <IconButton
                        size="small"
                        onClick={onSingleDelete(data.uuid)}
                        style={{ color: "red" }}
                    >
                        <i className="fa fa-trash" />
                    </IconButton> */}
                </Row>
            </>
        );
    });

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ListOfRoles")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mx-0 mb-2 justify-content-between">
                {selectedRecords.length > 0 && (
                    <Button
                        color="danger"
                        onClick={() => {
                            setSingleDeleteUuid(null);
                            modalRef?.current?.toggleModal();
                        }}
                    >
                        {t("DeleteRecords")}
                    </Button>
                )}

                {selectedRecords.length === 0 && (<div />)}

                <Button
                    color="primary"
                    onClick={() => onCreateNewPressHandler()}
                >
                    <i className="fa fa-plus mr-1" />
                    <span>{t("CreateNew")}</span>
                </Button>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={RolesListColDefs}
                        onGridReady={onGridReady}
                        rowData={rolesList}
                        gridHeight={580}
                        onRowDoubleClicked={onRowDoubleClicked}
                        onSelectionChanged={(event) => setSelectedRecords(
                            event.api.getSelectedNodes()
                        )}
                        frameworkComponents={{
                            actionRender
                        }}
                        sizeColumnsToFit
                    />
                </Col>
            </Row>
            <ActionModal
                ref={modalRef}
                title={t("Deletion")}
                body={t("Are you sure you want to delete these roles?")}
                button={t("Delete")}
                color="danger"
                action={() => onDeleteRecordsPressHandler()}
            />
        </Container>
    );
}
