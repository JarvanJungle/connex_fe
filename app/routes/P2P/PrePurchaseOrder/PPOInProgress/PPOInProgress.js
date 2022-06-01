/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from "react";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, ButtonToolbar, Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import { Conversation, AddItemRequest, Overview } from "routes/components";
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
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    formatDisplayDecimal,
    convertToLocalTime,
    formatDateTime,
    getCurrentCompanyUUIDByStore,
    itemAttachmentSchema,
    convertDate2String,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import ActionModal from "routes/components/ActionModal";
import { CommonConfirmDialog } from "routes/components";
import classNames from "classnames";
import { HeaderMain } from "routes/components/HeaderMain";
import PRE_PURCHASE_ORDER_ROUTES from "../route";
import {
    InitialSetting,
    GeneralInformation,
    RequestTerms,
    SupplierInfor
} from "../components";
import { getDataAuditTrail } from "../helper/utilities";

const PPOInProgress = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const refActionModalCancel = useRef(null);
    const refActionModalRecall = useRef(null);
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
        internalConversationLines: [],
        externalConversationLines: [],
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
        showReasonReject: false,
        showErrorReasonReject: false,
        reasonReject: "",
        showReasonSendBack: false,
        showErrorReasonSendBack: false,
        reasonSendBack: "",
        supplier: {},
        paymentTerms: "",
        activeAuditTrailTab: 1,
        rowDataOverview: []
    });
    const [enableConversation, setEnableConversation] = useState(false);
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

            const listPermission = userPermission[permissionReducer.featureBasedOn];
            let typeOfRequisitions = [];
            if (listPermission) {
                typeOfRequisitions = getTypeOfRequisitions(listPermission.features);
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
                showToast("error", error.response ? error.response.data.message : error.message);
            }

            // get internal/external conversation list
            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];
            const { pprUuid, prUuid, uuid } = data;
            const responses = await Promise.allSettled([
                pprUuid && ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
                pprUuid && ConversationService.getDetailExternalConversation(companyUuid, pprUuid),
                prUuid && ConversationService.getDetailInternalConversation(companyUuid, prUuid),
                prUuid && ConversationService.getDetailExternalConversation(companyUuid, prUuid),
                ConversationService.getDetailInternalConversation(companyUuid, uuid),
                ConversationService.getDetailExternalConversation(companyUuid, uuid)
            ]);
            const [
                responseInternalConversationsPPR,
                responseExternalConversationsPPR,
                responseInternalConversationsPR,
                responseExternalConversationsPR,
                responseInternalConversationsPPO,
                responseExternalConversationsPPO
            ] = responses;

            rowDataExternalConversation = rowDataExternalConversation.concat(
                getDataConversation(responseExternalConversationsPPR, false),
                getDataConversation(responseExternalConversationsPR, false),
                getDataConversation(responseExternalConversationsPPO, false)
            );
            rowDataInternalConversation = rowDataInternalConversation.concat(
                getDataConversation(responseInternalConversationsPPR),
                getDataConversation(responseInternalConversationsPR),
                getDataConversation(responseInternalConversationsPPO)
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
                rowDataInternalConversation,
                rowDataExternalConversation
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...ppoDetailsStates.internalConversationLines];
            const { rowDataInternalConversation } = ppoDetailsStates;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: new Date(),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = ppoDetailsStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...ppoDetailsStates.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: new Date(),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = ppoDetailsStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: new Date(),
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
            uploadedOn: new Date(),
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
            if (response.data.status === RESPONSE_STATUS.OK) {
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
            if (response.data.status === RESPONSE_STATUS.OK) {
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
                            attachment: result.fileLabel
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
                        attachment: result.fileLabel
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

    const onCancelPressHandler = async () => {
        try {
            const {
                companyUuid,
                ppoUuid
            } = ppoDetailsStates;

            const response = await PrePurchaseOrderService.cancelPPO(
                companyUuid, ppoUuid
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onRecallPressHandler = async () => {
        try {
            const {
                companyUuid,
                ppoUuid
            } = ppoDetailsStates;

            const response = await PrePurchaseOrderService.recallPPO(
                companyUuid, ppoUuid
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                setTimeout(() => {
                    history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSendBackPressHandler = async () => {
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            showErrorReasonSendBack: true
        }));

        if (ppoDetailsStates.reasonSendBack) {
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                showReasonSendBack: false
            }));

            try {
                const {
                    companyUuid,
                    ppoUuid,
                    rowDataInternalAttachment,
                    rowDataExternalAttachment
                } = ppoDetailsStates;
                const body = {
                    text: ppoDetailsStates.reasonSendBack,
                    newlyAddedPrePoDocuments: []
                };

                let newlyAddedPrePoDocuments = rowDataInternalAttachment.concat(rowDataExternalAttachment);
                newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.map(
                    ({ uuid, ...rest }) => rest
                );

                await itemAttachmentSchema.validate(
                    newlyAddedPrePoDocuments.filter((item) => item.isNew === true)
                );

                newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.filter(
                    (item) => (item.fileDescription || item.attachment || item.fileLabel || item.guid)
                        && item.isNew === true
                ).map(({
                    isNew,
                    uploadedOn,
                    fileLabel,
                    attachment,
                    uploadedTime,
                    ...item
                }) => ({
                    ...item,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedTime || uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                }));
                body.newlyAddedPrePoDocuments = newlyAddedPrePoDocuments;

                const response = await PrePurchaseOrderService.sendBackPPO(
                    companyUuid, ppoUuid, body
                );

                if (response.data.status === RESPONSE_STATUS.OK) {
                    const reasonSendBackConversation = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: [{ text: ppoDetailsStates.reasonSendBack }]
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, reasonSendBackConversation);

                    if (ppoDetailsStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: ppoUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: ppoDetailsStates.externalConversationLines
                        };
                        await ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (ppoDetailsStates.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: ppoUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: ppoDetailsStates.internalConversationLines
                        };
                        await ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const onRejectPressHandler = async () => {
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));

        if (ppoDetailsStates.reasonReject) {
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                showReasonReject: false
            }));
            try {
                const {
                    companyUuid,
                    ppoUuid,
                    rowDataInternalAttachment,
                    rowDataExternalAttachment
                } = ppoDetailsStates;
                const body = {
                    text: ppoDetailsStates.reasonReject,
                    newlyAddedPrePoDocuments: []
                };

                let newlyAddedPrePoDocuments = rowDataInternalAttachment.concat(rowDataExternalAttachment);
                newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.map(
                    ({ uuid, ...rest }) => rest
                );

                await itemAttachmentSchema.validate(
                    newlyAddedPrePoDocuments.filter((item) => item.isNew === true)
                );

                newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.filter(
                    (item) => (item.fileDescription || item.attachment || item.fileLabel || item.guid)
                        && item.isNew === true
                ).map(({
                    isNew,
                    uploadedOn,
                    fileLabel,
                    attachment,
                    uploadedTime,
                    ...item
                }) => ({
                    ...item,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedTime || uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                }));
                body.newlyAddedPrePoDocuments = newlyAddedPrePoDocuments;

                const response = await PrePurchaseOrderService.rejectPPO(
                    companyUuid, ppoUuid, body
                );

                if (response.data.status === RESPONSE_STATUS.OK) {
                    const reasonRejectConversation = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: [{ text: ppoDetailsStates.reasonReject }]
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, reasonRejectConversation);

                    if (ppoDetailsStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: ppoUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: ppoDetailsStates.externalConversationLines
                        };
                        await ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (ppoDetailsStates.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: ppoUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: ppoDetailsStates.internalConversationLines
                        };
                        await ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const onApprovePressHandler = async () => {
        try {
            const {
                companyUuid,
                ppoUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = ppoDetailsStates;

            let newlyAddedPrePoDocuments = rowDataInternalAttachment.concat(rowDataExternalAttachment);
            newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.map(
                ({ uuid, ...rest }) => rest
            );

            await itemAttachmentSchema.validate(
                newlyAddedPrePoDocuments.filter((item) => item.isNew === true)
            );

            newlyAddedPrePoDocuments = newlyAddedPrePoDocuments.filter(
                (item) => (item.fileDescription || item.attachment || item.fileLabel || item.guid)
                    && item.isNew === true
            ).map(({
                isNew, uploadedOn, fileLabel, attachment, uploadedTime, ...item
            }) => ({
                ...item,
                fileLabel: fileLabel || attachment,
                uploadedOn: convertToLocalTime(uploadedTime || uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
            }));

            const response = await PrePurchaseOrderService.approvePPO(
                companyUuid, ppoUuid, { newlyAddedPrePoDocuments }
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                // conversation
                if (ppoDetailsStates.externalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: ppoDetailsStates.externalConversationLines
                    };
                    await ConversationService
                        .createExternalConversation(companyUuid, conversationBody);
                }
                if (ppoDetailsStates.internalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: ppoDetailsStates.internalConversationLines
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, conversationBody);
                }

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const renderButtonAction = () => {
        const {
            firstApproved,
            prePoCreator,
            approverRole,
            hasApproved,
            loading,
            ppoDetails
        } = ppoDetailsStates;

        const { prePoStatus } = ppoDetails;

        if (prePoStatus !== "PENDING_APPROVAL"
            && prePoStatus !== "RECALLED"
            && prePoStatus !== "SENT_BACK"
        ) return (<></>);

        if (prePoCreator && !firstApproved) {
            if (!permission?.write && !permission?.read) return (<></>);

            return (
                <ButtonToolbar>
                    <Button
                        color="danger"
                        className="mr-3"
                        type="submit"
                        onClick={() => refActionModalCancel.current.toggleModal()}
                        disabled={loading}
                    >
                        {t("Cancel")}
                    </Button>
                    <Button
                        color="warning"
                        type="submit"
                        onClick={() => refActionModalRecall.current.toggleModal()}
                        disabled={loading}
                    >
                        {t("Recall")}
                    </Button>
                </ButtonToolbar>
            );
        }

        if (approverRole && !hasApproved) {
            setEnableConversation(true);
            return (
                <ButtonToolbar>
                    <Button
                        color="danger"
                        className="mr-3"
                        type="submit"
                        onClick={() => setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            showReasonReject: true
                        }))}
                        disabled={loading}
                    >
                        {t("Reject")}
                    </Button>
                    <Button
                        color="warning"
                        type="submit"
                        className="mr-3"
                        onClick={() => setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            showReasonSendBack: true
                        }))}
                        disabled={loading}
                    >
                        {t("SendBack")}
                    </Button>
                    <Button
                        color="primary"
                        type="submit"
                        onClick={() => onApprovePressHandler()}
                        disabled={loading}
                    >
                        {t("Approve")}
                    </Button>
                </ButtonToolbar>
            );
        }

        return (<></>);
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
                            && !_.isEmpty(permissionReducer)
                            && ppoDetailsStates.ppoUuid
                        ) {
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (companyUuid) initData(companyUuid);
                        }
                    }, [userDetails, ppoDetailsStates.ppoUuid, permissionReducer]);

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
                            let status = "";
                            const { prePoStatus } = ppoDetails;
                            if (prePoStatus === "SAVE_AS_DRAFT"
                                || prePoStatus === "SAVED_AS_DRAFT"
                            ) {
                                status = "PENDING SUBMISSION";
                            } else if (prePoStatus === "PENDING_APPROVAL") {
                                status = "PENDING PRE-PO APPROVAL";
                            } else if (prePoStatus === "PENDING_CONVERT_TO_PO") {
                                status = "PENDING CONVERSION TO PO";
                            } else {
                                status = prePoStatus.replaceAll("_", " ");
                            }
                            setFieldValue("prePoStatus", status);
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
                            setFieldValue("convertedDate",
                                ppoDetails.submittedDate
                                    ? convertToLocalTime(ppoDetails.submittedDate)
                                    : ppoDetails.submittedDate || "");
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

                            const rowDataAuditTrail = getDataAuditTrail(prePoAuditTrail);

                            const rowDataInternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            const rowDataExternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
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
                                                onChangeApprovalRoute={() => {}}
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
                                        onDeleteItem={() => {}}
                                        suppliers={ppoDetailsStates.suppliers}
                                        uoms={ppoDetailsStates.uoms}
                                        currencies={ppoDetailsStates.currencies}
                                        addresses={ppoDetailsStates.addresses}
                                        glAccounts={ppoDetailsStates.glAccounts}
                                        taxRecords={ppoDetailsStates.taxRecords}
                                        onCellValueChanged={() => {}}
                                        gridHeight={350}
                                        disabled
                                        isPurchaseOrderItems
                                        isProject={values.project}
                                    />
                                </Col>
                            </Row>
                            <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                <div style={{ textDecoration: "underline" }}>
                                    {t("InDocumentCurrency")}
                                </div>
                                <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                                    <div style={{ width: "200px" }}>
                                        <div>{`${t("SubTotal")}:`}</div>
                                        <div>{`${t("Tax")}:`}</div>
                                        <div>{`${t("Total(include GST)")}:`}</div>
                                    </div>
                                    <div style={{ width: "100px" }}>
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                    </div>
                                    <div style={{ marginLeft: "40px" }}>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.subTotal, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.tax, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.total, 2) || "0.00"}</div>
                                    </div>
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
                                        onCellEditingStopped={() => {}}
                                        defaultExpanded
                                        disabled={!enableConversation}
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
                                        onCellEditingStopped={() => {}}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={!enableConversation}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail - Overview */}
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
                                    {renderButtonAction()}
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            <ActionModal
                ref={refActionModalCancel}
                title="Cancel Pre-Purchase Order"
                body="Do you wish to cancel this order?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onCancelPressHandler()}
            />
            <ActionModal
                ref={refActionModalRecall}
                title="Recall Pre-Purchase Order"
                body="Do you wish to recall this order?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onRecallPressHandler()}
            />
            <CommonConfirmDialog
                isShow={ppoDetailsStates.showReasonSendBack}
                onHide={() => setPPODetailsStates((prevStates) => ({
                    ...prevStates,
                    showReasonSendBack: false
                }))}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onSendBackPressHandler(),
                        contentPositive: t("SendBack"),
                        colorPositive: "warning"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            showReasonSendBack: false
                        })),
                        contentNegative: t("Close"),
                        colorNegative: "secondary"
                    }
                }
                size="xs"
                titleCenter
                titleRequired
            >
                <Input
                    type="textarea"
                    rows={5}
                    name="sendBackReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": ppoDetailsStates.showErrorReasonSendBack && !ppoDetailsStates.reasonSendBack
                        })
                    }
                    placeholder={t("EnterReason")}
                    value={ppoDetailsStates.reasonSendBack}
                    onChange={(e) => {
                        const { value } = e.target;
                        setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            reasonSendBack: value
                        }));
                    }}
                />
                {
                    ppoDetailsStates.showErrorReasonSendBack && !ppoDetailsStates.reasonSendBack
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
            <CommonConfirmDialog
                isShow={ppoDetailsStates.showReasonReject}
                onHide={() => setPPODetailsStates((prevStates) => ({
                    ...prevStates,
                    showReasonReject: false
                }))}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onRejectPressHandler(),
                        contentPositive: t("Reject"),
                        colorPositive: "danger"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            showReasonReject: false
                        })),
                        contentNegative: t("Close"),
                        colorNegative: "secondary"
                    }
                }
                size="xs"
                titleCenter
                titleRequired
            >
                <Input
                    type="textarea"
                    rows={5}
                    name="sendBackReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": ppoDetailsStates.showErrorReasonReject && !ppoDetailsStates.reasonReject
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={ppoDetailsStates.reasonReject}
                    onChange={(e) => {
                        const { value } = e.target;
                        setPPODetailsStates((prevStates) => ({
                            ...prevStates,
                            reasonReject: value
                        }));
                    }}
                />
                {
                    ppoDetailsStates.showErrorReasonReject && !ppoDetailsStates.reasonReject
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
        </Container>
    );
};

export default PPOInProgress;
