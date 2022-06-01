/* eslint-disable no-unused-vars */
import React, {
    useState, useEffect, useRef, useImperativeHandle, forwardRef
} from "react";
import { AgGridTable } from "routes/components";
import ManageRolesService from "services/ManageRolesService/ManageRolesService";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col, Button
} from "components";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import ActionModal from "routes/components/ActionModal";
import MANAGE_ROLES_ROUTE from "routes/EntityAdmin/ManageRoles/routes";
import IconButton from "@material-ui/core/IconButton";
import { RoleRender } from "../components";
import rolesListColDefs from "../ColumnDefs";
import MANAGE_ROLES_ROUTES from "../routes";
import { usePermission } from "routes/hooks";

export default function RolesList() {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState(null);
    const [rolesList, setRolesList] = useState([]);
    const [companyUuid, setCompanyUuid] = useState("");
    const [selectedRecords, setSelectedRecords] = useState([]);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const handleRolePermission = usePermission(FEATURE.ROLE);
    const [singleDeleteUuid, setSingleDeleteUuid] = useState(null);
    const modalRef = useRef();

    const getData = async (currentCompanyUuid) => {
        setCompanyUuid(currentCompanyUuid);
        gridApi.showLoadingOverlay();
        try {
            const response = await ManageRolesService.getRolesList(currentCompanyUuid);
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
        if (!_.isEmpty(permissionReducer)
            && gridApi
        ) {
            const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (currentCompanyUuid) getData(currentCompanyUuid);
        }
    }, [permissionReducer, gridApi]);

    const onDeleteRecordsPressHandler = async () => {
        const listData = singleDeleteUuid
            ? [singleDeleteUuid]
            : selectedRecords.map((item) => item.data.uuid);
        try {
            await Promise.all(listData.map(ManageRolesService.deleteRole));
            showToast("success", "Role deleted successfully");
            getData(getCurrentCompanyUUIDByStore(permissionReducer));
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
    };

    const onCreateNewPressHandler = () => {
        history.push(MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE);
    };

    const onRowDoubleClicked = (event) => {
        history.push({
            pathname: MANAGE_ROLES_ROUTES.ROLE_DETAILS,
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
                {data?.createdBy === "Doxa Admin" && (
                    <Row className="mx-0 justify-content-center">
                        <Link
                            to={{
                                pathname: MANAGE_ROLES_ROUTE.CREATE_NEW_ROLE,
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
                    </Row>
                )}
                {data?.createdBy !== "Doxa Admin" && (
                    <Row className="mx-0 justify-content-between">
                        <Link
                            to={{
                                pathname: MANAGE_ROLES_ROUTE.ROLE_DETAILS,
                                search: `?uuid=${data?.uuid}`
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => { }}
                            >
                                <i className="fa fa-pencil" />
                            </IconButton>
                        </Link>
                        <Link
                            to={{
                                pathname: MANAGE_ROLES_ROUTE.CREATE_NEW_ROLE,
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
                        <IconButton
                            size="small"
                            onClick={onSingleDelete(data.uuid)}
                            style={{ color: "red" }}
                        >
                            <i className="fa fa-trash" />
                        </IconButton>
                    </Row>
                )}
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
                {handleRolePermission?.write && (
                    <Button
                        color="primary"
                        onClick={() => onCreateNewPressHandler()}
                    >
                        <i className="fa fa-plus mr-1" />
                        <span>{t("CreateNew")}</span>
                    </Button>
                )}
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={rolesListColDefs(handleRolePermission?.write)}
                        onGridReady={onGridReady}
                        rowData={rolesList}
                        gridHeight={580}
                        onRowDoubleClicked={onRowDoubleClicked}
                        onSelectionChanged={(event) => setSelectedRecords(
                            event.api.getSelectedNodes()
                        )}
                        frameworkComponents={{
                            roleRender: RoleRender,
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
