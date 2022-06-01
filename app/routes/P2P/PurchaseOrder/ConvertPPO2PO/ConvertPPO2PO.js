/* eslint-disable max-len */
import React, { useState, useEffect } from "react";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import {
    Conversation, AddItemRequest, Overview
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GLDataService from "services/GLService";
import EntitiesService from "services/EntitiesService";
import TaxRecordDataService from "services/TaxRecordService";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import {
    formatDisplayDecimal, convertToLocalTime, formatDateTime, getCurrentCompanyUUIDByStore, convertDate2String, roundNumberWithUpAndDown
} from "helper/utilities";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import { convertAction } from "routes/P2P/PrePurchaseOrder/helper/utilities";
import { HeaderMain } from "routes/components/HeaderMain";
import PURCHASE_ORDER_ROUTES from "../route";
import {
    InitialSetting,
    GeneralInformation,
    RequestTerms,
    SupplierInfor
} from "../../PrePurchaseOrder/components";

const ConvertPPO2PO = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const [ppoDetailsStates, setPPODetailsStates] = useState({
        loading: true,
        isEdit: false,
        ppoDetails: {},
        ppoUuid: "",
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        suppliers: [],
        uoms: [],
        currencies: [],
        taxRecords: [],
        addresses: [],
        glAccounts: [],
        typeOfRequisitions: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        approvalRoutes: [],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataItemReq: [],
        rowDataAuditTrail: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        prePoCreator: true,
        approverRole: false,
        firstApproved: false,
        hasApproved: false,
        supplier: {},
        paymentTerms: "",
        activeAuditTrailTab: 1,
        rowDataOverview: []
    });
    const permission = usePermission(FEATURE.PPO);

    const initialValues = {
        project: false,
        projectCode: "",
        prNumber: "",
        prUuid: "",
        prePoStatus: "",
        currencyCode: "",
        supplier: {},
        prePoNumber: "",
        prePoTitle: "",
        procurementType: "",
        approvalRouteName: "",
        approvalRouteSequence: "",
        approvalRouteUuid: "",
        nextApprover: "",
        requestorUuid: "",
        requestorName: "",
        convertedDate: "",
        paymentTerms: "",
        address: {},
        addressUuid: "",
        remarks: ""
    };

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const ppoUuid = query.get("uuid");
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            ppoUuid
        }));
    }, []);

    const getTypeOfRequisitions = (features) => {
        const typeOfRequisitions = [];
        features.forEach((feature) => {
            if (["PR", "WR", "VR", "BC"].indexOf(feature.featureCode) > -1) {
                typeOfRequisitions.push({
                    label: feature.feature.featureName,
                    value: feature.featureName
                });
            }
        });
        return typeOfRequisitions;
    };

    const getSupplier = async (companyUuid, supplierUuid) => {
        try {
            const response = await ExtVendorService.getExternalVendorDetails(companyUuid, supplierUuid);
            const { data } = response.data;
            const { addressesDto, supplierUserList, paymentTerm } = data;
            const contactPerson = supplierUserList.find((item) => item.default === true);
            const supplier = {};
            supplier.companyCode = data.companyCode;
            supplier.companyName = data.companyName;
            supplier.companyRegNo = data.companyRegNo;
            supplier.contactPersonEmail = contactPerson.emailAddress;
            supplier.contactPersonName = contactPerson.fullName;
            supplier.contactPersonWorkNumber = contactPerson.workNumber;
            supplier.countryCode = `+ ${contactPerson.countryCode}`;
            supplier.uuid = data.uuid;
            return {
                addressesDto,
                supplier,
                paymentTerms: paymentTerm.ptName
            };
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return [];
    };

    const getDataConversation = (responseData, isInternal = true) => {
        const result = [];
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            if (!value) return result;
            const { data, status, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                if (data) {
                    data.conversations.forEach((item) => {
                        result.push({
                            userName: item.sender,
                            userRole: item.designation,
                            userUuid: item.userUuid,
                            dateTime: convertDate2String(
                                isInternal ? item.date : item.createdAt,
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss
                            ),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
                }
            } else {
                showToast("error", message);
            }
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return result;
    };

    const initData = async (companyUuid) => {
        try {
            const { ppoUuid } = ppoDetailsStates;

            const responseCurrencies = await CurrenciesService.getCurrencies(
                companyUuid
            );

            const currencies = responseCurrencies.data.data.filter(
                (currency) => currency.active === true
            );

            const responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                companyUuid, "PPO"
            );

            const responseAddresses = await AddressDataService.getCompanyAddresses(
                companyUuid
            );

            const addresses = responseAddresses.data.data.filter(
                (address) => address.active === true
            );

            const responseUOMs = await UOMDataService.getUOMRecords(
                companyUuid
            );

            const responseGLAccounts = await GLDataService.getGLs(
                companyUuid
            );

            const responseTaxRecords = await TaxRecordDataService.getTaxRecords(
                companyUuid
            );
            const taxRecords = responseTaxRecords.data.data.filter(
                (taxRecord) => taxRecord.active === true
            );

            const listFeature = userPermission[permissionReducer.featureBasedOn];
            let typeOfRequisitions = [];
            if (listFeature) {
                typeOfRequisitions = getTypeOfRequisitions(listFeature.features);
            }

            const responsePPODetails = await PrePurchaseOrderService.getPPODetails(
                companyUuid, ppoUuid
            );

            const { data } = responsePPODetails.data;

            const supplier = await getSupplier(
                companyUuid,
                data.supplier ? data.supplier.uuid : data.supplierUuid
            );

            const overview = [];
            try {
                const resOverview = await PrePurchaseOrderService
                    .getPPOOverviewDetails(companyUuid, ppoUuid);
                if (resOverview.data.status === RESPONSE_STATUS.OK) {
                    const getAllItemsPerChildren = (item, parent) => {
                        const newItem = { ...item };
                        newItem.type = item.documentType;
                        let documentTree = [item.documentNumber];
                        if (parent) {
                            documentTree = [...parent.documentType];
                            documentTree.push(item.documentNumber);
                        }
                        newItem.documentType = documentTree;
                        overview.push({ ...newItem, documentType: documentTree });
                        if (item.childNodes) {
                            item.childNodes.forEach(
                                (i) => getAllItemsPerChildren(i, newItem)
                            );
                        }
                    };
                    resOverview.data.data.forEach((item) => {
                        getAllItemsPerChildren(item, null);
                    });
                }
            } catch (error) {
                console.log("error", error);
            }

            const responses = await Promise.allSettled([
                ConversationService.getDetailInternalConversation(companyUuid, ppoUuid),
                ConversationService.getDetailExternalConversation(companyUuid, ppoUuid),
                data.prUuid && ConversationService.getDetailInternalConversation(companyUuid, data.prUuid),
                data.prUuid && ConversationService.getDetailExternalConversation(companyUuid, data.prUuid),
                data.pprUuid && ConversationService.getDetailInternalConversation(companyUuid, data.pprUuid),
                data.pprUuid && ConversationService.getDetailExternalConversation(companyUuid, data.pprUuid)
            ]);
            const [
                responseInternalConversations,
                responseExternalConversations,
                responseInternalConversationsPR,
                responseExternalConversationsPR,
                responseInternalConversationsPPR,
                responseExternalConversationsPPR
            ] = responses;
            let rowDataExternalConversation = getDataConversation(
                responseExternalConversations, false
            );
            rowDataExternalConversation = rowDataExternalConversation.concat(
                getDataConversation(
                    responseExternalConversationsPR, false
                )
            );
            rowDataExternalConversation = rowDataExternalConversation.concat(
                getDataConversation(
                    responseExternalConversationsPPR, false
                )
            );

            let rowDataInternalConversation = getDataConversation(
                responseInternalConversations
            );
            rowDataInternalConversation = rowDataInternalConversation.concat(
                getDataConversation(responseInternalConversationsPR)
            );
            rowDataInternalConversation = rowDataInternalConversation.concat(
                getDataConversation(responseInternalConversationsPPR)
            );

            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                typeOfRequisitions,
                companyUuid,
                currencies,
                approvalRoutes: responseApprovalRoutes.data.data,
                addresses,
                uoms: responseUOMs.data.data,
                glAccounts: responseGLAccounts.data.data,
                taxRecords,
                ppoDetails: responsePPODetails.data.data,
                suppliers: supplier.addressesDto,
                supplier: supplier.supplier,
                paymentTerms: supplier.paymentTerms,
                rowDataOverview: overview,
                rowDataExternalConversation,
                rowDataInternalConversation
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        try {
            const { companyUuid } = ppoDetailsStates;
            if (isInternal) {
                const { rowDataInternalConversation } = ppoDetailsStates;
                const body = {
                    username: userDetails.name,
                    userUuid: userDetails.uuid,
                    role: userDetails.designation,
                    comment,
                    submitOn: convertToLocalTime(new Date()),
                    featureName: "Purchase Order"
                };

                const response = await ConversationService.createExternalConversation(companyUuid, body);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                } else {
                    showToast("error", response.data.message);
                }

                const newRowData = [...rowDataInternalConversation];
                newRowData.push({
                    userName: userDetails.name,
                    userRole: userDetails.designation,
                    userUuid: userDetails.uuid,
                    dateTime: convertToLocalTime(new Date()),
                    comment,
                    externalConversation: false
                });
                setPPODetailsStates((prevStates) => ({
                    ...prevStates,
                    rowDataInternalConversation: newRowData
                }));
                return;
            }

            const { rowDataExternalConversation } = ppoDetailsStates;
            const body = {
                username: userDetails.name,
                userUuid: userDetails.uuid,
                role: userDetails.designation,
                comment,
                submitOn: convertToLocalTime(new Date()),
                featureName: "Purchase Order"
            };

            const response = await ConversationService.createInternalConversation(companyUuid, body);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
            } else {
                showToast("error", response.data.message);
            }
            const newRowData = [...rowDataExternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: convertToLocalTime(new Date()),
                comment,
                externalConversation: true
            });
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataExternalConversation: newRowData
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = ppoDetailsStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: convertToLocalTime(new Date()),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = ppoDetailsStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: convertToLocalTime(new Date()),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            const file = event.target.files[0];
            data.append("file", file);
            data.append("category", "purchase-service/documents");
            data.append("uploaderRole", "user");
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === "BAD_REQUEST") {
                    showToast("error", "We don't support this file format, please upload another.");
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
    };

    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === "OK") {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };

    const onAddAttachment = (event, uuid, rowData, isInternal) => {
        handleFileUpload(event).then((result) => {
            if (!result) return;
            if (isInternal) {
                const newRowData = [...rowData];
                newRowData.forEach((row, index) => {
                    if (row.uuid === uuid) {
                        newRowData[index] = {
                            ...row,
                            guid: result.guid,
                            fileLabel: result.fileLabel
                        };
                    }
                });
                setPPODetailsStates((prevStates) => ({
                    ...prevStates,
                    rowDataInternalAttachment: newRowData
                }));
                return;
            }

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        fileLabel: result.fileLabel
                    };
                }
            });
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onConvertPressHandler = async () => {
        try {
            const {
                companyUuid,
                ppoUuid
            } = ppoDetailsStates;

            const response = await PurchaseOrderService.convertPPO2PO(companyUuid, ppoUuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && ppoDetailsStates.ppoUuid
                        ) {
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (companyUuid) initData(companyUuid);
                        }
                    }, [userDetails, permissionReducer, ppoDetailsStates.ppoUuid]);

                    useEffect(() => {
                        if (!_.isEmpty(ppoDetailsStates.ppoDetails)) {
                            const {
                                ppoDetails,
                                addresses,
                                glAccounts,
                                currencies,
                                suppliers,
                                taxRecords,
                                supplier,
                                paymentTerms,
                                uoms
                            } = ppoDetailsStates;
                            const {
                                prePoAuditTrail,
                                prePoDocumentMetadata,
                                prePoItem,
                                prePoCreator,
                                approverRole,
                                firstApproved,
                                hasApproved
                            } = ppoDetails;
                            setFieldValue("project", ppoDetails.project);
                            if (ppoDetails.project) {
                                setFieldValue("projectCode", ppoDetails.projectCode);
                            }
                            setFieldValue("prNumber", ppoDetails.prNumber);
                            setFieldValue("prUuid", ppoDetails.uuid);
                            setFieldValue("prePoStatus", "PENDING CONVERSION TO PO");
                            setFieldValue("currencyCode", ppoDetails.currencyCode);
                            setFieldValue("supplier", ppoDetails.supplier || supplier);
                            setFieldValue("prePoNumber", ppoDetails.prePoNumber);
                            setFieldValue("prePoTitle", ppoDetails.prePoTitle);
                            setFieldValue("procurementType", ppoDetails.procurementType || "");
                            setFieldValue("approvalRouteName", ppoDetails.approvalRouteName || "");
                            setFieldValue("approvalRouteSequence", ppoDetails.approvalRouteSequence || "");
                            setFieldValue("approvalRouteUuid", ppoDetails.approvalRouteUuid || "");
                            setFieldValue("nextApprover", ppoDetails.nextApprover || "");
                            setFieldValue("requestorUuid", ppoDetails.requestorUuid || "");
                            setFieldValue("requestorName", ppoDetails.requestorName || "");
                            setFieldValue("convertedDate", convertToLocalTime(ppoDetails.convertedDate || ""));
                            setFieldValue("paymentTerms", ppoDetails.paymentTerms || paymentTerms);
                            if (ppoDetails.address) {
                                setFieldValue("addressUuid", suppliers.find(
                                    (item) => item.addressFirstLine === ppoDetails.address.addressFirstLine
                                        && item.addressLabel === ppoDetails.address.addressLabel
                                        && item.addressSecondLine === ppoDetails.address.addressSecondLine
                                        && item.city === ppoDetails.address.city
                                        && item.country === ppoDetails.address.country
                                        && item.postalCode === ppoDetails.address.postalCode
                                        && item.state === ppoDetails.address.state
                                )?.uuid);
                                setFieldValue("address", ppoDetails.address || {});
                            } else {
                                setFieldValue("addressUuid", suppliers[0].uuid);
                                setFieldValue("address", suppliers[0]);
                            }
                            setFieldValue("remarks", ppoDetails.remarks || "");

                            const rowDataItemReq = prePoItem.map(
                                ({
                                    address,
                                    accountNumber,
                                    sourceCurrency,
                                    supplierUuid,
                                    taxCode,
                                    uom,
                                    requestedDeliveryDate,
                                    ...res
                                }) => {
                                    const itemReq = {
                                        ...res,
                                        address: addresses.find(
                                            (item) => item.addressFirstLine === address.addressFirstLine
                                                && item.addressLabel === address.addressLabel
                                                && item.addressSecondLine === address.addressSecondLine
                                                && item.city === address.city
                                                && item.country === address.country
                                                && item.postalCode === address.postalCode
                                                && item.state === address.state
                                        ),
                                        accountNumber: glAccounts.find(
                                            (item) => item.accountNumber === accountNumber
                                        ),
                                        sourceCurrency: currencies.find(
                                            (item) => item.currencyCode === sourceCurrency
                                        ),
                                        taxCode: taxRecords.find(
                                            (item) => item.taxCode.toLowerCase() === taxCode?.toLowerCase()
                                        ),
                                        uom: uoms.find(
                                            (item) => item.uomCode.toLowerCase() === uom?.toLowerCase()
                                        ),
                                        requestedDeliveryDate: formatDateTime(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                                        uuid: uuidv4()
                                    };

                                    itemReq.inSourceCurrencyBeforeTax = (itemReq.itemQuantity || 0) * (itemReq.itemUnitPrice || 0);
                                    itemReq.inDocumentCurrencyBeforeTax = itemReq.inSourceCurrencyBeforeTax * (itemReq.exchangeRate || 0);
                                    itemReq.taxAmountInDocumentCurrency = ((itemReq.taxRate || 0) * itemReq.inDocumentCurrencyBeforeTax) / 100;
                                    itemReq.inDocumentCurrencyAfterTax = itemReq.inDocumentCurrencyBeforeTax + itemReq.taxAmountInDocumentCurrency;

                                    return itemReq;
                                }
                            );

                            const subTotal = rowDataItemReq.reduce((a, b) => a + b.inDocumentCurrencyBeforeTax, 0);
                            const tax = rowDataItemReq.reduce((a, b) => a + b.taxAmountInDocumentCurrency, 0);
                            const total = roundNumberWithUpAndDown(subTotal) + roundNumberWithUpAndDown(tax);

                            const rowDataAuditTrail = prePoAuditTrail.map(
                                ({ action, dateTime, ...rest }) => ({
                                    ...rest,
                                    action: convertAction(action),
                                    role: rest.userRole,
                                    date: convertToLocalTime(dateTime, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
                                })
                            );

                            const rowDataInternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
                                uploadedTime: uploadedOn,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            const rowDataExternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
                                uploadedTime: uploadedOn,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            setPPODetailsStates((prevStates) => ({
                                ...prevStates,
                                loading: false,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                rowDataItemReq,
                                rowDataAuditTrail,
                                subTotal,
                                tax,
                                total,
                                prePoCreator,
                                approverRole,
                                firstApproved,
                                hasApproved
                            }));
                        }
                    }, [ppoDetailsStates.ppoDetails]);

                    return (
                        <Form>
                            <HeaderMain
                                title={t("PrePurchaseOrderDetails")}
                                className="mb-3 mb-lg-3"
                            />
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Initial Settings */}
                                            <InitialSetting
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                suppliers={ppoDetailsStates.suppliers}
                                                currencies={ppoDetailsStates.currencies}
                                                disabled
                                            />
                                            <SupplierInfor
                                                t={t}
                                                values={values}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            <GeneralInformation
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={ppoDetailsStates.procurementTypes}
                                                approvalRoutes={ppoDetailsStates.approvalRoutes}
                                                onChangeApprovalRoute={() => { }}
                                                disabled
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={ppoDetailsStates.suppliers}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("PurchaseOrderItems")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    <AddItemRequest
                                        rowDataItemReq={ppoDetailsStates.rowDataItemReq}
                                        onDeleteItem={() => { }}
                                        suppliers={ppoDetailsStates.suppliers}
                                        uoms={ppoDetailsStates.uoms}
                                        currencies={ppoDetailsStates.currencies}
                                        addresses={ppoDetailsStates.addresses}
                                        glAccounts={ppoDetailsStates.glAccounts}
                                        taxRecords={ppoDetailsStates.taxRecords}
                                        onCellValueChanged={() => { }}
                                        gridHeight={350}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                <div style={{ textDecoration: "underline" }}>
                                    {t("InDocumentCurrency")}
                                </div>
                                <Row className="justify-content-end" style={{ width: "380px", textAlign: "right" }}>
                                    <Col xs={6}>
                                        <div>{`${t("SubTotal")}:`}</div>
                                        <div>{`${t("Tax")}:`}</div>
                                        <div>{`${t("Total(include GST)")}:`}</div>
                                    </Col>
                                    <Col xs={3}>
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                    </Col>
                                    <Col xs={3}>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.subTotal, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.tax, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.total, 2) || "0.00"}</div>
                                    </Col>
                                </Row>
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
                                        activeTab={ppoDetailsStates.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, true)}
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={ppoDetailsStates.rowDataInternalConversation}
                                        rowDataAttachment={ppoDetailsStates.rowDataInternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, true)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, true)}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={ppoDetailsStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, false)}
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={ppoDetailsStates.rowDataExternalConversation}
                                        rowDataAttachment={ppoDetailsStates.rowDataExternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, false)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, false)}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail */}
                                    <Overview
                                        rowData={ppoDetailsStates.rowDataOverview}
                                        rowDataAuditTrail={ppoDetailsStates.rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        autoGroupColumnDef={autoGroupColumnDef}
                                        groupDefaultExpanded={-1}
                                        getDataPath={getDataPath}
                                        gridHeight={350}
                                        defaultExpanded
                                        borderTopColor="#AEC57D"
                                        paginationPageSize={10}
                                        activeTab={ppoDetailsStates.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={ppoDetailsStates.companyUuid}
                                    />
                                </Col>
                            </Row>

                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {
                                        ppoDetailsStates?.ppoDetails?.prePoCreator
                                        && !ppoDetailsStates?.ppoDetails?.approverRole
                                        && permission?.write
                                        && permission?.read
                                        && (
                                            <Button
                                                color="primary"
                                                onClick={() => onConvertPressHandler()}
                                                disabled={ppoDetailsStates.loading}
                                            >
                                                {t("ConvertToOrder")}
                                            </Button>
                                        )
                                    }
                                    {
                                        !ppoDetailsStates?.ppoDetails?.prePoCreator
                                        && (<></>)
                                    }
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};

export default ConvertPPO2PO;
