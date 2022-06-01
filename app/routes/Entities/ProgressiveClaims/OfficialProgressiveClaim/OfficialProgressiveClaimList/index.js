import React, { useEffect, useState } from "react";
import URL_CONFIG from "services/urlConfig";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { HeaderMain } from "routes/components/HeaderMain";
import {
    Col,
    Container,
    Row
} from "components";
import { useSelector } from "react-redux";
import {
    defaultColDef,
    OfficialProgressClaimListColumnDefsForBuyer,
    OfficialProgressClaimListColumnDefsForSupplier,
    OfficialProgressClaimListColumnDefsForArchitect,
    PC_STATUS
} from "../Helper";
import { AgGridTable } from "../../../../components";
import { OfficialProgressiveClaimService } from "../../../../../services/OfficialProgressiveClaimService";

export default function OfficialProgressiveClaimList() {
    const { t } = useTranslation();
    const history = useHistory();
    const showToast = useToast();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [progressClaimState, setProgressClaimState] = useState({
        loading: false,
        gridApi: null,
        officialList: [],
        selectRow: {},
        isArchitect: false
    });

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setProgressClaimState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    const selectOfficialClaim = (params) => {
        history.push(
            `${URL_CONFIG.PROGRESSIVE_ROUTES.OFFICIAL_PROGRESS_CLAIM_LIST_CREATE.replace(
                ":uuid",
                params.data.pcUuid
            )}`
        );
    };

    const getData = async (companyUuid) => {
        const { gridApi } = progressClaimState;
        gridApi.showLoadingOverlay();
        try {
            const response = await OfficialProgressiveClaimService.getClaimMcList(
                companyUuid,
                permissionReducer.isBuyer
            );

            gridApi.hideOverlay();
            let officialList = response.data.data;

            const displayStatusForBuyer = [
                PC_STATUS.PENDING_ACKNOWLEDGEMENT,
                PC_STATUS.SENT_BACK_TO_MAIN_CONTRACTOR,
                PC_STATUS.REJECTED,
                PC_STATUS.PENDING_SUBMISSION,
                PC_STATUS.PENDING_EVALUATION_APPROVAL,
                PC_STATUS.SENT_BACK_TO_MAIN_CONTRACTOR,
                PC_STATUS.PENDING_VALUATION,
                PC_STATUS.RECALLED,
                PC_STATUS.PENDING_SUBMISSION_TO_MAIN_QS,
                PC_STATUS.SUBMITTED_EVALUATION,
                PC_STATUS.RECALLED_BY_QS,
                PC_STATUS.PENDING_SUBMISSION_TO_ARCHITECT,
                PC_STATUS.SUBMITTED_TO_ARCHITECT,
                PC_STATUS.ARCHITECT_ACKNOWLEDGED
            ];
            const displayStatusForSupplier = [
                PC_STATUS.CREATED,
                PC_STATUS.PENDING_ISSUE,
                PC_STATUS.PENDING_ACKNOWLEDGEMENT,
                PC_STATUS.PENDING_EVALUATION_APPROVAL,
                PC_STATUS.SENT_BACK_TO_MAIN_CONTRACTOR,
                PC_STATUS.REJECTED,
                PC_STATUS.CANCELLED,
                PC_STATUS.PENDING_VALUATION,
                PC_STATUS.PENDING_SUBMISSION_TO_ARCHITECT,
                PC_STATUS.SUBMITTED_TO_ARCHITECT,
                PC_STATUS.ARCHITECT_ACKNOWLEDGED
            ];
            if (permissionReducer.isBuyer) {
                officialList = officialList
                    .filter((item) => displayStatusForBuyer.includes(item.pcStatus));
            } else {
                officialList = officialList
                    .filter((item) => displayStatusForSupplier.includes(item.pcStatus));
            }

            setProgressClaimState((prevStates) => ({
                ...prevStates,
                officialList
            }));

            if (response.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast(
                "error",
                error.response ? error.response.data.message : error.message
            );
            gridApi.showNoRowsOverlay();
        }
    };

    useEffect(() => {
        if (
            permissionReducer
            && permissionReducer?.currentCompany
            && progressClaimState.gridApi
        ) {
            getData(permissionReducer.currentCompany.companyUuid);
        }
    }, [permissionReducer, progressClaimState.gridApi]);
    let columnDefs;
    if (permissionReducer.isBuyer) {
        if (progressClaimState.isArchitect) {
            columnDefs = OfficialProgressClaimListColumnDefsForArchitect;
        } else {
            columnDefs = OfficialProgressClaimListColumnDefsForBuyer;
        }
    } else {
        columnDefs = OfficialProgressClaimListColumnDefsForSupplier;
    }
    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Developer Progress Claim List")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                        {permissionReducer && permissionReducer.currentCompany && (
                            <AgGridTable
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={progressClaimState.officialList}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={selectOfficialClaim}
                                onCellClicked={() => { }}
                                suppressRowClickSelection
                                onSelectionChanged={() => { }}
                                gridHeight={580}
                            />
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
