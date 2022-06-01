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
    OfficialProgressClaimListColumnDefsForArchitect,
    ACE_STATUS
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
            `${URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST_CREATE.replace(
                ":uuid",
                params.data.pcUuid
            )}`
        );
    };

    const getData = async (companyUuid) => {
        const { gridApi } = progressClaimState;
        gridApi.showLoadingOverlay();
        try {
            const response = await OfficialProgressiveClaimService.getArchitectClaimMcList(
                companyUuid,
                permissionReducer.isBuyer
            );

            gridApi.hideOverlay();
            let officialList = response.data.data;

            const displayStatusForArchitect = [
                ACE_STATUS.PENDING_ARCHITECT_REVIEW,
                ACE_STATUS.PENDING_ISSUE_ARCHITECT_CERT,
                ACE_STATUS.PENDING_AC_APPROVAL,
                ACE_STATUS.PENDING_ARCHITECT_ACKNOWLEDGEMENT,
                ACE_STATUS.PENDING_MC_AC_ACKNOWLEDGEMENT,
                ACE_STATUS.PENDING_CONVERT_TO_INVOICE,
                ACE_STATUS.CONVERTED_TO_INVOICE
            ];
            if (permissionReducer.isBuyer) {
                officialList = officialList.filter((item) => displayStatusForArchitect.includes(item.aceStatus));
            } else {
                officialList = officialList.filter((item) => displayStatusForArchitect.includes(item.aceStatus));
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
        columnDefs = OfficialProgressClaimListColumnDefsForArchitect;
    } else {
        columnDefs = OfficialProgressClaimListColumnDefsForArchitect;
    }
    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Architect Progress Claim List")}
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
                                onCellClicked={() => {}}
                                suppressRowClickSelection
                                onSelectionChanged={() => {}}
                                gridHeight={580}
                            />
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
