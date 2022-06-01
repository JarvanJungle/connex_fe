import React, { useState, useEffect, useMemo } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { CONTRACT_REQUEST_LIST_STATUS, RESPONSE_STATUS } from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import {
    Container,
    Row,
    Col
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { ContractModuleService } from "services/ContractModuleService";
import CONTRACT_REQUEST_FORM_ROUTE from "services/ContractModuleService/urls";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router";
import ContractListBuyerDefs from "./ContractListBuyerDefs";
import ContractListSupplierDefs from "./ContractListSupplierDefs";
import ContractRequestTooltip from "../ContractRequestList/ContractRequestTooltip";

function ContractList() {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const [contractListState, setContractListState] = useState({
        loading: false,
        gridApi: null,
        contractList: []
    });

    const getData = async (isBuyer, companyUuid) => {
        const { gridApi } = contractListState;
        gridApi.showLoadingOverlay();
        try {
            const response = await ContractModuleService
                .getContractListByType(isBuyer, companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let myContract = response.data.data;
                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    myContract = myContract.filter((item) => query?.get("status")?.split(",")?.includes(item.contractStatus) ?? true);
                }
                setContractListState((prevStates) => ({
                    ...prevStates,
                    contractList: myContract.length > 0 ? myContract.reverse() : myContract
                }));

                if (myContract?.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setContractListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        if (permissionReducer && permissionReducer?.currentCompany
        && !_.isEmpty(userDetails) && contractListState.gridApi) {
            getData(permissionReducer.isBuyer, permissionReducer.currentCompany.companyUuid);
        }
    }, [permissionReducer, userDetails, contractListState.gridApi]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        console.log(data);
        history.push(CONTRACT_REQUEST_FORM_ROUTE
            .CONTRACT_FORM_DETAIL.replace(":uuid", data.contractUuid));
        // if (data.status === CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL) {
        //     history.push(`${CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_FORM}?uuid=${data.contractRequestUuid}`);
        // }
        // else if (data.prStatus === PURCHASE_REQUISITION_STATUS.RECALLED
        //     || data.prStatus === PURCHASE_REQUISITION_STATUS.SENT_BACK) {
        //     history.push(`${URL_PURCHASE_REQUEST
        // .EDIT_PURCHASE_REQUISITION_DETAILS}?uuid=${data.uuid}`);
        // } else if (data.prStatus === PURCHASE_REQUISITION_STATUS.SAVE_AS_DRAFT
        //     || data.prStatus === "SAVED AS DRAFT"
        // ) {
        //     history.push(`${URL_PURCHASE_REQUEST
        // .EDIT_DRAFT_PURCHASE_REQUISITION}?uuid=${data.uuid}`);
        // } else {
        //     history.push(`${URL_PURCHASE_REQUEST.VIEW_REQUISITION_DETAILS}?uuid=${data.uuid}`);
        // }
    };

    const contractList = useMemo(() => {
        if (!permissionReducer?.isBuyer) {
            return contractListState?.contractList?.filter((contract) => ![
                CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT_CONTRACT,
                CONTRACT_REQUEST_LIST_STATUS.PENDING_SUBMISSION,
                CONTRACT_REQUEST_LIST_STATUS.PENDING_ISSUE_CONTRACT,
                CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL_CONTRACT,
                CONTRACT_REQUEST_LIST_STATUS.SEND_BACK_CONTRACT,
                CONTRACT_REQUEST_LIST_STATUS.CANCELLED,
                CONTRACT_REQUEST_LIST_STATUS.RECALLED,
                CONTRACT_REQUEST_LIST_STATUS.REJECTED
            ].includes(contract?.contractStatus));
        }
        return contractListState.contractList;
    }, [contractListState.contractList, permissionReducer?.isBuyer]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ContractList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={permissionReducer?.isBuyer
                            ? ContractListBuyerDefs : ContractListSupplierDefs}
                        onGridReady={onGridReady}
                        rowData={contractList}
                        frameworkComponents={{
                            customTooltip: ContractRequestTooltip
                        }}
                        gridHeight={580}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default ContractList;
