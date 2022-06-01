import React, {
    useEffect,
    useState
} from "react";
import { Link } from "react-router-dom";
import URL_CONFIG from "services/urlConfig";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import { AgGridReact } from "components/agGrid";
import i18next from "i18next";
import {
    useHistory,
    useLocation
} from "react-router";
import { HeaderMain } from "routes/components/HeaderMain";
import {
    ButtonGroup,
    ButtonToolbar,
    Col,
    Container,
    Row,
    Button
} from "components";
import { useSelector } from "react-redux";
import { formatDateTime } from "helper/utilities";
import {
    defaultColDef,
    DraftProgressClaimListColumnDefsForSupplier,
    DraftProgressClaimListColumnDefsForBuyer,
    DPC_STATUS
} from "../Helper";
import { AgGridTable } from "../../../../components";
import { DraftProgressiveClaimService } from "../../../../../services/DraftProgressiveClaimService";
import {
    DWO_STATUSES,
    RESPONSE_STATUS,
    VENDOR_ACK
} from "../../../../../helper/constantsDefined";

export default function DraftProgressiveClaimList() {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [draftProgressClaimState, setDraftProgressClaimState] = useState({
        loading: false,
        gridApi: null,
        draftList: [],
        selectRow: {}
    });

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setDraftProgressClaimState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    const selectDraftClaim = (params) => {
        history.push(`${URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE.replace(":dpcUuid", params.data.dpcUuid)}`);
    };

    const getData = async (companyUuid) => {
        const { gridApi } = draftProgressClaimState;
        gridApi.showLoadingOverlay();
        try {
            const response = await DraftProgressiveClaimService
                .getClaimMcList(companyUuid, permissionReducer.isBuyer);

            gridApi.hideOverlay();
            let draftList = response.data.data;

            const displayStatusForBuyer = [
                DPC_STATUS.PENDING_ACKNOWLEDGEMENT,
                DPC_STATUS.SENT_BACK_TO_MAIN_CONTRACTOR,
                DPC_STATUS.REJECTED,
                DPC_STATUS.PENDING_SUBMISSION,
                DPC_STATUS.PENDING_APPROVAL,
                DPC_STATUS.PENDING_VALUATION,
                DPC_STATUS.SENT_BACK,
                DPC_STATUS.RECALLED,

                DPC_STATUS.PENDING_SUBMISSION_TO_MAIN_QS,
                DPC_STATUS.SUBMITTED_EVALUATION,

                DPC_STATUS.PENDING_REVERT,
                DPC_STATUS.RECALLED_BY_QS,

                DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
            ];
            const displayStatusForSupplier = [
                DPC_STATUS.CREATED,
                DPC_STATUS.PENDING_ISSUE,
                DPC_STATUS.PENDING_ACKNOWLEDGEMENT,
                DPC_STATUS.PENDING_APPROVAL,
                DPC_STATUS.SENT_BACK_TO_MAIN_CONTRACTOR,
                DPC_STATUS.REJECTED,
                DPC_STATUS.CANCELLED,
                DPC_STATUS.PENDING_VALUATION,

                DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
            ];

            if (permissionReducer.isBuyer) {
                draftList = draftList
                    .filter((item) => displayStatusForBuyer.includes(item.dpcStatus));
            } else {
                draftList = draftList
                    .filter((item) => displayStatusForSupplier.includes(item.dpcStatus));
            }

            setDraftProgressClaimState((prevStates) => ({
                ...prevStates,
                draftList
            }));

            if (response.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    useEffect(() => {
        if (
            permissionReducer
            && permissionReducer?.currentCompany
            && draftProgressClaimState.gridApi
        ) {
            getData(permissionReducer.currentCompany.companyUuid);
        }
    }, [permissionReducer, draftProgressClaimState.gridApi]);
    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Draft Progress Claim List")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row>
                <Col lg={12}>
                    <div className="d-flex mb-2">
                        <ButtonToolbar className="ml-auto">
                            <ButtonGroup className="align-self-start">
                                {/* <Link to={URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE}> */}
                                {/*    <Button color="primary" className="mb-2 mr-2 px-3"> */}
                                {/*        <i className="fa fa-plus" /> */}
                                {/*        {" "} */}
                                {/*        {t("Create New")} */}
                                {/*    </Button> */}
                                {/* </Link> */}
                            </ButtonGroup>
                        </ButtonToolbar>
                    </div>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                        {
                            permissionReducer && permissionReducer.currentCompany
                            && (
                                <AgGridTable
                                    columnDefs={
                                        permissionReducer.isBuyer
                                            ? DraftProgressClaimListColumnDefsForBuyer
                                            : DraftProgressClaimListColumnDefsForSupplier
                                    }
                                    defaultColDef={defaultColDef}
                                    rowData={draftProgressClaimState.draftList}
                                    pagination
                                    paginationPageSize={10}
                                    onGridReady={onGridReady}
                                    rowSelection="multiple"
                                    rowMultiSelectWithClick
                                    onRowDoubleClicked={selectDraftClaim}
                                    onCellClicked={() => {
                                    }}
                                    suppressRowClickSelection
                                    onSelectionChanged={() => {
                                    }}
                                    gridHeight={580}
                                />
                            )
                        }

                    </div>
                </Col>
            </Row>
        </Container>
    );
}
