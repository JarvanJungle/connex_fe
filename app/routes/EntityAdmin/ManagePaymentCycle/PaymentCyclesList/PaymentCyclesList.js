import React, { useEffect, useRef, useState } from "react";
import {
    Button, ButtonToolbar, Col, Container, Row
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { AgGridTable } from "routes/components";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PaymentCycleService from "services/PaymentCycleService";
import { defaultColDef } from "helper/utilities";
import useToast from "routes/hooks/useToast";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import UploadButton from "routes/components/UploadButton";
import { useHistory } from "react-router";
import ActionModal from "routes/components/ActionModal";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import getColumnDefs from "./ColumnDefs";
import PAYMENT_CYCLE_ROUTE from "../routes";

export default () => {
    const showToast = useToast();
    const { t } = useTranslation();
    const history = useHistory();
    const toast = useToast();
    const permissionReducer = useSelector((s) => s?.permissionReducer);
    const uploadBtnRef = useRef(null);
    const activateModalRef = useRef(null);
    const deactivateModalRef = useRef(null);
    const [gridApi, setGridApi] = useState(null);
    const [actionButtonShow, setActionButtonShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [companyUuid, setCompanyUuid] = useState(null);
    const [selectedPaymentCycle, setSelectedPaymentCycle] = useState(null);
    const paymentCyclePermission = usePermission(FEATURE.PAYMENT_CYCLE);

    const getData = async () => {
        try {
            const { data } = await PaymentCycleService.getPaymentCycleList(companyUuid);
            gridApi.setRowData(data);
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = ({ api }) => {
        api.sizeColumnsToFit();
        api.showLoadingOverlay();
        setGridApi(api);
    };
    const onRowDoubleClicked = ({ data }) => {
        history.push(`${PAYMENT_CYCLE_ROUTE.UPDATE_PAYMENT_CYCLE}?uuid=${data?.uuid}`);
    };

    useEffect(() => {
        if (companyUuid && gridApi) {
            getData();
        }
    }, [companyUuid, gridApi]);

    useEffect(() => {
        if (permissionReducer?.currentCompany?.companyUuid) {
            setCompanyUuid(permissionReducer?.currentCompany?.companyUuid);
        }
    }, [permissionReducer]);

    const handleExport = () => {
        gridApi.exportDataAsCsv({ fileName: CSVTemplate.PaymentCycle_List_DownloadFileName });
    };

    const handleUpload = async (csvData = []) => {
        // Remove first element - header element
        setLoading(true);
        try {
            csvData.shift();
            const payload = csvData
                // Filter valid row: Payment Cycle Code, Payment Cycle Date and Is active required
                .filter(({ data }) => data[0] && data[1] && ["Yes", "No"].includes(data[4]))
                .map(({ data }) => ({
                    paymentCycleCode: data[0],
                    paymentCycleDate: data[1],
                    description: data[2],
                    companyCode: data[3],
                    active: data[4] === "Yes"
                }));
            if (payload.length === 0) throw Error("No valid row to upload");
            await PaymentCycleService.massUploadPaymentCycle(companyUuid, payload);
            showToast("success", "Upload completed");
            await getData();
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
        setLoading(false);
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        setActionButtonShow(selectedNodes.length > 0);
    };

    const handleActivate = async () => {
        const selectedUuids = selectedPaymentCycle
            ? [selectedPaymentCycle]
            : gridApi.getSelectedNodes().map((r) => r?.data?.uuid);
        try {
            await PaymentCycleService.activatePaymentCycle(companyUuid, selectedUuids);
            toast("success", "Payment cycle activated!");
            await getData();
        } catch (e) {
            toast("error", e?.response?.data?.message || e?.message);
        }
    };

    const handleDeactivate = async () => {
        const selectedUuids = selectedPaymentCycle
            ? [selectedPaymentCycle]
            : gridApi.getSelectedNodes().map((r) => r?.data?.uuid);
        try {
            await PaymentCycleService.deactivatePaymentCycle(companyUuid, selectedUuids);
            toast("success", "Payment cycle deactivated!");
            await getData();
        } catch (e) {
            toast("error", e?.response?.data?.message || e?.message);
        }
    };

    const actionRenderer = ({ data }) => {
        if (data.active) {
            return (
                <span
                    onClick={
                        () => setSelectedPaymentCycle(data.uuid)
                            || deactivateModalRef?.current?.toggleModal()
                    }
                    style={{ color: "red", cursor: "pointer" }}
                >
                    <i className="fa fa-close mr-2" />
                    Deactivate
                </span>
            );
        }
        return (
            <span
                onClick={
                    () => setSelectedPaymentCycle(data.uuid)
                        || activateModalRef?.current?.toggleModal()
                }
                style={{ color: "navy", cursor: "pointer" }}
            >
                <i className="fa fa-plus mr-2" />
                Reactivate
            </span>
        );
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ListOfPaymentCycles")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row>
                <Col lg={12}>
                    <div className="d-flex mb-2">
                        {paymentCyclePermission.write && actionButtonShow && (
                            <>
                                <Button
                                    color="primary"
                                    className="mb-2 mr-2 px-3"
                                    onClick={
                                        () => setSelectedPaymentCycle(null)
                                            || activateModalRef?.current?.toggleModal()
                                    }
                                >
                                    {t("Activate")}
                                </Button>
                                <Button
                                    color="danger"
                                    className="mb-2 mr-2 px-3"
                                    onClick={
                                        () => setSelectedPaymentCycle(null)
                                            || deactivateModalRef?.current?.toggleModal()
                                    }
                                >
                                    {t("Deactivate")}
                                </Button>
                            </>
                        )}
                        <ButtonToolbar className="ml-auto">
                            <Button
                                color="secondary"
                                className="mb-2 mr-2 px-3"
                                onClick={handleExport}
                            >
                                <i className="fa fa-download" />
                                {" "}
                                {t("Download")}
                            </Button>
                            {paymentCyclePermission.write && (
                                <>
                                    <UploadButton
                                        isLoading={loading}
                                        buttonRef={uploadBtnRef}
                                        translation={t}
                                        handleOnDrop={handleUpload}
                                        handleOnError={(e) => showToast("error", e)}
                                        handleOpenDialog={(e) => uploadBtnRef?.current?.open(e)}
                                    />
                                    <Button color="primary" className="mb-2 mr-2 px-3">
                                        <CSVLink
                                            data={CSVTemplate.PaymentCycle_List_Data}
                                            headers={CSVTemplate.PaymentCycle_List_Headers}
                                            filename={CSVTemplate.PaymentCycle_List_TemplateFileName}
                                            style={{ color: "white" }}
                                        >
                                            <i className="fa fa-download" />
                                            {" "}
                                            {t("Template")}
                                        </CSVLink>
                                    </Button>
                                    <Link to={PAYMENT_CYCLE_ROUTE.CREATE_PAYMENT_CYCLE}>
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
                    <AgGridTable
                        defaultColDef={defaultColDef}
                        columnDefs={getColumnDefs(paymentCyclePermission.write)}
                        rowData={[]}
                        onGridReady={onGridReady}
                        onRowDoubleClicked={onRowDoubleClicked}
                        frameworkComponents={{
                            customTooltip: CustomTooltip,
                            actionColRenderer: actionRenderer
                        }}
                        sizeColumnsToFit
                        onSelectionChanged={onSelectionChanged}
                    />
                </Col>
            </Row>
            <ActionModal
                ref={activateModalRef}
                title={t("Activation")}
                body={t("Are you sure you want to activate these payment cycles?")}
                button={t("Activate")}
                color="primary"
                action={() => handleActivate()}
            />
            <ActionModal
                ref={deactivateModalRef}
                title={t("Deactivation")}
                body={t("Are you sure you want to deactivate these payment cycles?")}
                button="Deactivate"
                color="danger"
                action={() => handleDeactivate()}
            />
        </Container>
    );
};
