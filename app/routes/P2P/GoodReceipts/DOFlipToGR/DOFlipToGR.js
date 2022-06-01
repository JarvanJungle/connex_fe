import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import {
    InitialSettings, GeneralInfor, DODetailsTable
} from "./components";
import GOODS_RECEIPT_ROUTES from "../route";

const DOFlipToGR = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const showToast = useToast();

    const [doDetailsState, setDODetailsState] = useState({
        loading: true,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataDODetails: [],
        doDetails: {},
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ]
    });

    const initialValues = {
        isEdit: false,
        deliveryOrderNumber: "",
        status: "",
        deliveryDate: "",
        buyerCode: "",
        buyerName: "",
        contactName: "",
        contactEmail: "",
        contactNumber: "",
        country: "",
        companyRegNo: "",
        procurementType: ""
    };

    const initData = async (companyUuid, doUuids) => {
        try {
            const response = await GoodsReceiptService.getDetailsDOForCreatingGR(
                companyUuid, doUuids
            );
            const { data } = response && response.data;
            setDODetailsState((prevStates) => ({
                ...prevStates,
                doDetails: data
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onFlipToGRPressHandler = () => {
        const { doDetails } = doDetailsState;
        history.push({
            pathname: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_DO,
            state: { data: { grDetails: doDetails } }
        });
    };

    useEffect(() => {
        const { companyUuid } = doDetailsState;
        if (companyUuid) {
            const { state } = location;
            const { data } = state;
            const doUuids = data.map((item) => item.doUuid);
            initData(companyUuid, doUuids);
        }
    }, [doDetailsState.companyUuid]);

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID && !_.isEmpty(userDetails)) {
            setDODetailsState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID
            }));
        }
    }, [permissionReducer, userDetails]);

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                onSubmit={() => {
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue
                }) => {
                    useEffect(() => {
                        const { doDetails } = doDetailsState;
                        if (!_.isEmpty(doDetails)) {
                            const {
                                deliveryOderNumbers,
                                items,
                                supplierInfo
                            } = doDetails;
                            setFieldValue("deliveryOrderNumber", deliveryOderNumbers.join(", "));
                            if (supplierInfo) {
                                setFieldValue("buyerCode", supplierInfo?.companyCode);
                                setFieldValue("buyerName", supplierInfo?.companyName);
                                setFieldValue("contactName", supplierInfo?.contactPersonName);
                                setFieldValue("contactEmail", supplierInfo?.contactPersonEmail);
                                setFieldValue("contactNumber", supplierInfo?.contactPersonNumber);
                                setFieldValue("country", supplierInfo?.country);
                                setFieldValue("companyRegNo", supplierInfo?.uen);
                                setFieldValue("countryCode", supplierInfo?.countryCode);
                            }

                            setDODetailsState((prevStates) => ({
                                ...prevStates,
                                loading: false,
                                rowDataDODetails: items
                            }));
                        }
                    }, [doDetailsState.doDetails]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={12} lg={12}>
                                            <HeaderSecondary
                                                title={t("DeliveryOrder")}
                                                className="mb-2"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <InitialSettings
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                            />
                                        </Col>

                                        <Col md={6} lg={6}>
                                            <GeneralInfor
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={doDetailsState.procurementTypes}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("DeliveryOrderDetails")}
                                className="mb-2"
                            />
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* Delivery Order Details */}
                                    <DODetailsTable
                                        rowData={doDetailsState.rowDataDODetails}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        gridHeight={350}
                                        defaultExpanded
                                        borderTopColor="#AEC57D"
                                    />
                                </Col>
                            </Row>
                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    {/* Internal Conversations */}
                                    <Conversation
                                        title={t("InternalConversations")}
                                        activeTab={doDetailsState.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setDODetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        rowDataConversation={
                                            doDetailsState.rowDataInternalConversation
                                        }
                                        rowDataAttachment={
                                            doDetailsState.rowDataInternalAttachment
                                        }
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        onDeleteAttachment={() => {}}
                                        onAddAttachment={() => {}}
                                        onCellEditingStopped={() => {}}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={doDetailsState.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setDODetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        rowDataConversation={
                                            doDetailsState.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            doDetailsState.rowDataExternalAttachment
                                        }
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        onDeleteAttachment={() => { }}
                                        onAddAttachment={() => { }}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                    />
                                </Col>
                            </Row>
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between align-items-center">
                                    <Button
                                        color="danger"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <Row className="mx-0">
                                        <Button
                                            color="primary"
                                            type="submit"
                                            onClick={() => onFlipToGRPressHandler()}
                                            disabled={doDetailsState.loading}
                                        >
                                            {t("FlipToGR")}
                                        </Button>
                                    </Row>
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};
export default DOFlipToGR;
