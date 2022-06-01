import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import {
    Container,
    Row,
    Col
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { ContractModuleService, CONTRACT_MODULE_ROUTE } from "services/ContractModuleService";
import { useHistory } from "react-router-dom";
import ApprovalGroupService from "services/ApprovalGroupService";
import { useLocation } from "react-router";
import ContractRequestListColDefs from "./ContractRequestListColDefs";
import ContractRequestTooltip from "./ContractRequestTooltip";

function ContractRequestList() {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const [crListState, setCRListState] = useState({
        loading: false,
        gridApi: null,
        crList: []
    });
    const [approvalGroup, setApprovalGroup] = useState([]);
    const [key, setKey] = useState(1);

    const getData = async (companyUuid) => {
        const { gridApi } = crListState;
        gridApi.showLoadingOverlay();
        try {
            const response = await ContractModuleService.getContractRequestList(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let crList = response.data.data;
                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    crList = crList.filter((item) => query?.get("status")?.split(",")?.includes(item.status) ?? true);
                }
                setCRListState((prevStates) => ({
                    ...prevStates,
                    crList
                }));

                if (crList?.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? (error.response.data.message ?? error.response.data.status) : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setCRListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
        params.api.showLoadingOverlay();
    };

    const getApprovalGroup = async () => {
        const response = await ApprovalGroupService
            .getAllGroups(permissionReducer.currentCompany.companyUuid);
        if (response.data.status === "OK") {
            setApprovalGroup(response.data.data);
            setKey(key + 1);
        } else {
            throw new Error(response.data.message);
        }
    };

    const NextApprovalGroupCellRender = (params) => {
        const { value } = params;
        if (value && approvalGroup.length) {
            const groupSelected = approvalGroup.find((group) => group.uuid === value);
            return groupSelected ? groupSelected.groupName : "";
        }
        return "";
    };

    useEffect(() => {
        try {
            if (permissionReducer && permissionReducer?.currentCompany) {
                getApprovalGroup();
            }
        } catch (error) {
            showToast("error", error.response ? (error.response.data.message ?? error.response.data.status) : error.message);
        }
    }, [permissionReducer]);

    useEffect(() => {
        if (permissionReducer && permissionReducer?.currentCompany
        && !_.isEmpty(userDetails) && crListState.gridApi) {
            getData(permissionReducer.currentCompany.companyUuid);
        }
    }, [permissionReducer, userDetails, crListState.gridApi]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        history.push(`${CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_FORM}/${data.contractRequestUuid}`);
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ContractRequestList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        key={key}
                        className="ag-theme-custom-react"
                        columnDefs={ContractRequestListColDefs}
                        onGridReady={onGridReady}
                        rowData={crListState.crList}
                        gridHeight={580}
                        frameworkComponents={{
                            customTooltip: ContractRequestTooltip,
                            nextApprovalGroupCellRender: NextApprovalGroupCellRender
                        }}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                        tooltipShowDelay={0}
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default ContractRequestList;
