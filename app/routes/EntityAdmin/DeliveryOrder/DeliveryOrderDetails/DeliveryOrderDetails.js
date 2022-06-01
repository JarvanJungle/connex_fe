import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import {
    clearNumber, convertToLocalTime, formatDateString, formatDateTime, isNullOrUndefined
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, Overview } from "routes/components";
import useToast from "routes/hooks/useToast";
import EntitiesService from "services/EntitiesService";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderMain } from "routes/components/HeaderMain";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import { useCurrentCompany, usePermission } from "routes/hooks";
import InitialSettingsComponent from "../components/InitialSettingsComponent";
import GeneralInformationComponent from "../components/GeneralInformationComponent";
import { DeliveryOrderDetailsTable } from "../components/DeliveryOrderDetailsTable";
import DO_ROUTES from "../route";
import { DO_FE_STATUS, DO_STATUS } from "../doConfig";

const DeliveryOrderDetails = () => {
    const requestFormRef = useRef(null);
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const currentCompany = useCurrentCompany();
    const showToast = useToast();

    const [doStatus, setDoStatus] = useState(DO_STATUS.CREATE_DO);
    const [cellValueChange, setCellValueChange] = useState();
    const [gridColumnApi, setGridColumnApi] = useState();
    const [isSupplier, setIsSupplier] = useState(false);
    const handleRolePermission = usePermission(FEATURE.DO);

    const [doDetailsState, setDODetailsState] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        activeAuditTrailTab: 1,
        addresses: [],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        rowDataOverview: [],
        rowDataDODetails: [],
        documentList: [],
        externalConversationLines: [],
        internalConversationLines: [],
        doUuid: "",
        enablePrefix: ""
    });
    const initialValues = {
        isEdit: true,
        deliveryOrderNumber: "",
        status: "",
        deliveryDate: "",
        buyerCode: "",
        countryCode: "",
        buyerName: "",
        contactName: "",
        contactEmail: "",
        contactNumber: "",
        country: "",
        companyRegNo: "",
        procurementType: "",
        enablePrefix: "",
        isIssue: false,
        isView: false
    };
    const validationSchema = Yup.object().shape({
        deliveryDate: Yup.string()
            .required(t("PleaseSelectValidDeliveryDate")),
        deliveryOrderNumber: Yup.string()
            .test(
                "doRequired",
                t("PleaseSelectValidDeliveryOrderNumber"),
                (value, testContext) => {
                    const { parent } = testContext;
                    if (parent.enablePrefix && !value) {
                        return false;
                    }
                    return true;
                }
            )
    });
    const itemSchema = Yup.array()
        .of(
            Yup.object().shape({
                qtyToConvert: Yup.string()
                    .required(t("ItemReqPleaseSelectValidToConvert"))
            })
        );
    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...doDetailsState.internalConversationLines];
            const { rowDataInternalConversation } = doDetailsState;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setDODetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = doDetailsState;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...doDetailsState.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setDODetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };
    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = doDetailsState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });
            setDODetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = doDetailsState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });
        setDODetailsState((prevStates) => ({
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
                            attachment: result.fileLabel
                        };
                    }
                });
                setDODetailsState((prevStates) => ({
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
            setDODetailsState((prevStates) => ({
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
            setDODetailsState((prevStates) => ({
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
        setDODetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = doDetailsState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setDODetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = doDetailsState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setDODetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const initData = () => {

    };
    const convertStatus = (params) => {
        switch (params) {
        case DO_STATUS.PENDING_ISSUE:
        {
            return DO_FE_STATUS.PENDING_ISSUE;
        }
        case DO_STATUS.PENDING_RECEIPT:
        {
            return DO_FE_STATUS.PENDING_RECEIPT;
        }
        case DO_STATUS.DELIVERED:
        {
            return DO_FE_STATUS.DELIVERED;
        }
        case DO_STATUS.PARTIALLY_DELIVERED:
        {
            return DO_FE_STATUS.PARTIALLY_DELIVERED;
        }
        default: return params;
        }
    };
    const convertAction = (value) => {
        switch (value) {
        case "DO Created":
            return "Created Delivery Order";
        case "DO Issued":
            return "Issued Delivery Order";
        default: return value;
        }
    };

    const getDeliveryOrderDetails = async (doUuid, currentCompanyUUID) => {
        if (!isNullOrUndefined(currentCompanyUUID)) {
            try {
                const res = await DeliveryOrderService
                    .getDeliveryOrderDetails(currentCompanyUUID, doUuid);
                const {
                    data, status, statusCode
                } = res.data;
                if (status === "OK" || statusCode === 200) {
                    setDoStatus(data.status);
                    const statusData = convertStatus(data.status);
                    requestFormRef?.current?.setValues({
                        isEdit: data.status === DO_STATUS.PENDING_ISSUE,
                        deliveryOrderNumber: data.deliveryOrderNumber,
                        status: statusData,
                        deliveryDate:
                            formatDateString(new Date(data.deliveryDate),
                                CUSTOM_CONSTANTS.YYYYMMDD),
                        buyerCode: data.buyerInfo.buyerCode,
                        buyerName: data.buyerInfo.buyerName,
                        countryCode: data.buyerInfo.countryCode,
                        contactName: data.buyerInfo.contactName,
                        contactEmail: data.buyerInfo.contactEmail,
                        contactNumber: data.buyerInfo.contactNumber,
                        country: data.buyerInfo.country,
                        companyRegNo: data.buyerInfo.companyRegNo,
                        procurementType: data.procurementType,
                        isIssue: data.status === DO_STATUS.PENDING_ISSUE,
                        isView: data.status !== DO_STATUS.PENDING_ISSUE
                    });
                    const itemList = data.itemList?.map((item) => ({
                        ...item,
                        isIssue: data.status === DO_STATUS.PENDING_ISSUE,
                        isView: data.status !== DO_STATUS.PENDING_ISSUE,
                        completedDelivery: (data.status === DO_STATUS.PENDING_ISSUE
                            || data.status === DO_STATUS.PENDING_RECEIPT)
                            ? Number(clearNumber(item.poQuantity))
                            - (Number(clearNumber(item.poQtyReceived))
                                + Number(clearNumber(item.qtyToConvert))) === 0
                            : Number(clearNumber(item.poQuantity))
                            - Number(clearNumber(item.poQtyReceived))
                            === 0,
                        qtyRejected: item.qtyRejected,
                        qtyReceived: item.qtyReceived
                    }));
                    const rowDataExternalConversation = [
                        ...doDetailsState.rowDataExternalConversation];
                    const uuids = [
                        ...data?.poUuids || [],
                        ...data?.ppoUuids || [],
                        ...data?.pprUuids || [],
                        ...data?.prUuids || []
                    ];
                    const listUuid = uuids?.filter((item) => item);
                    const newArr = [];
                    listUuid.forEach((item) => {
                        if (!newArr.includes(item)) {
                            newArr.push(item);
                        }
                    });
                    const requests = newArr.map(async (uuid) => {
                        try {
                            const resExternalConversation = await ConversationService
                                .getDetailExternalConversation(
                                    data.buyerInfo.buyerCompanyUuid, uuid
                                );
                            if (resExternalConversation.data.status === "OK") {
                                resExternalConversation?.data?.data?.conversations?.forEach(
                                    (item) => {
                                        rowDataExternalConversation.push({
                                            userName: item.sender,
                                            userRole: item.designation,
                                            userUuid: item.userUuid,
                                            dateTime: formatDateString(new Date(item.createdAt),
                                                CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                            comment: item.text,
                                            externalConversation: true
                                        });
                                    }
                                );
                            }
                            return resExternalConversation.data.data;
                        } catch (error) {
                            console.log("error", error);
                        }
                    });
                    await Promise.all(requests);
                    try {
                        const resConversation = await ConversationService
                            .getDetailExternalConversation(
                                currentCompanyUUID, doUuid
                            );
                        if (resConversation.data.status === "OK") {
                            resConversation?.data?.data?.conversations?.forEach((item) => {
                                rowDataExternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation,
                                    userUuid: item.userUuid,
                                    dateTime: formatDateString(new Date(item.createdAt),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                            });
                        }
                    } catch (error) {
                        console.log("error", error);
                    }
                    const rowDataInternalConversation = [
                        ...doDetailsState.rowDataInternalConversation];
                    try {
                        const resInternalConversation = await ConversationService
                            .getDetailInternalConversation(
                                currentCompanyUUID, doUuid
                            );
                        if (resInternalConversation.data.status === "OK") {
                            resInternalConversation?.data?.data?.conversations?.forEach(
                                (item) => {
                                    rowDataInternalConversation.push({
                                        userName: item.sender,
                                        userRole: item.designation,
                                        userUuid: item.userUuid,
                                        dateTime: formatDateString(new Date(item.date),
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                        comment: item.text,
                                        externalConversation: true
                                    });
                                }
                            );
                        }
                    } catch (error) {
                        console.log("error", error);
                    }

                    const overview = [];
                    try {
                        const resOverview = await DeliveryOrderService
                            .getDOOverview(currentCompanyUUID, doUuid);
                        if (resOverview.data.status === "OK") {
                            const getAllItemsPerChildren = (item, parent) => {
                                item.type = item.documentType;
                                let documentTree = [item.documentType];
                                if (parent) {
                                    documentTree = [...parent.documentType];
                                    documentTree.push(item.documentType);
                                }
                                item.documentType = documentTree;
                                overview.push({ ...item, documentType: documentTree });
                                if (item.childNodes) {
                                    item.childNodes.forEach(
                                        (i) => getAllItemsPerChildren(i, item)
                                    );
                                }
                            };
                            resOverview.data.data?.forEach((item) => {
                                getAllItemsPerChildren(item, null);
                            });
                        }
                    } catch (error) {
                        console.log("error", error);
                    }
                    setDODetailsState((prevStates) => ({
                        ...prevStates,
                        rowDataAuditTrail: data?.auditList?.map((item) => ({
                            userName: item.userName,
                            role: item.role,
                            date: convertToLocalTime(item.date),
                            action: convertAction(item.action)
                        })),
                        rowDataExternalAttachment: data?.documentList?.map((item) => ({
                            ...item,
                            uploadedBy: item.uploadedByName,
                            uploadedOn: convertToLocalTime(item.uploadedOn)
                        })),
                        rowDataDODetails: itemList,
                        documentList: data.documentList,
                        rowDataExternalConversation,
                        rowDataInternalConversation,
                        rowDataOverview: overview
                    }));
                }
            } catch (err) {
                showToast("error", err.message);
            }
        }
    };
    const initDOCreateDetail = async (createDetail, currentCompanyUUID) => {
        try {
            let enablePrefix = false;
            const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
            if (response.data.status === "OK") {
                const { data } = response.data;
                data.supplierPortalList?.forEach((item) => {
                    if (item.functionName === "Delivery Order" && item.type === "Manual") {
                        enablePrefix = true;
                    }
                });
            } else {
                throw new Error(response.data.message);
            }
            requestFormRef?.current?.setValues({
                deliveryDate: "",
                deliveryOrderNumber: "",
                buyerCode: createDetail.buyerCompanyCode,
                buyerName: createDetail.buyerCompanyName,
                countryCode: createDetail.countryCode,
                contactName: createDetail.buyerContactName,
                contactEmail: createDetail.buyerContactEmail,
                contactNumber: createDetail.buyerContactNumber,
                country: createDetail.buyerCountry,
                companyRegNo: createDetail.buyerCompanyRegistrationNo,
                procurementType: createDetail.procurementType,
                isEdit: true,
                isIssue: false,
                isView: false,
                status: "",
                enablePrefix
            });
            const rowDataExternalConversation = [
                ...doDetailsState.rowDataExternalConversation];
            const newDoList = [];
            createDetail.itemLists?.forEach((item) => {
                if (!newDoList.includes(item)) {
                    newDoList.push(item.poUuid);
                }
            });
            const uuids = [
                ...createDetail?.poUuids || [],
                ...createDetail?.ppoUuids || [],
                ...createDetail?.pprUuids || [],
                ...createDetail?.prUuids || [],
                ...newDoList
            ];
            const listUuid = uuids?.filter((item) => item);
            const newArr = [];
            listUuid.forEach((item) => {
                if (!newArr.includes(item)) {
                    newArr.push(item);
                }
            });
            const requests = newArr.map(async (uuid) => {
                try {
                    const resExternalConversation = await ConversationService
                        .getDetailExternalConversation(
                            createDetail.buyerCompanyUuid, uuid
                        );
                    if (resExternalConversation.data.status === "OK") {
                        resExternalConversation?.data?.data?.conversations
                            .forEach((item) => {
                                rowDataExternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation,
                                    userUuid: item.userUuid,
                                    dateTime: formatDateString(new Date(item.createdAt),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                            });
                    }
                    return resExternalConversation.data.data;
                } catch (error) {
                    console.log("error", error);
                }
            });
            await Promise.all(requests);
            setDODetailsState((prevStates) => ({
                ...prevStates,
                rowDataDODetails: createDetail.itemList,
                rowDataOverview: [],
                rowDataExternalConversation,
                enablePrefix,
                documentList: createDetail?.poDocumentDtoList || [],
                rowDataExternalAttachment: createDetail?.poDocumentDtoList?.map((item) => ({
                    ...item,
                    fileLabel: item.fileName,
                    fileDescription: item.description,
                    uploadedBy: item.uploadBy,
                    uploadedOn: convertToLocalTime(item.uploadOn)
                })) || []
            }));
        } catch (err) {
            console.log(err);
        }
    };

    const mappingCreateBodyParams = (params) => {
        const doDetailList = doDetailsState.rowDataDODetails;
        const externalAttachmentDoc = doDetailsState.rowDataExternalAttachment;
        const itemList = doDetailList?.map((e) => ({
            poUuid: e.poUuid,
            itemCode: e.itemCode,
            priceType: e?.priceType,
            qtyToConvert: e.qtyToConvert ? Number(clearNumber(e.qtyToConvert)) : "",
            notesToBuyer: e.notesToBuyer
        }));
        externalAttachmentDoc.forEach((item) => {
            if (!item.guid) {
                throw new Error("Please attach a file!");
            }
        });
        const currentAttachment = doDetailsState.documentList;
        const listDocDto = externalAttachmentDoc.filter((item) => currentAttachment
            .filter((value) => value.guid === item.guid).length === 0);
        const DOBody = {
            deliveryOrderNumber: params.deliveryOrderNumber,
            deliveryDate: formatDateTime(params.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            itemList,
            documentList: listDocDto?.map((item) => ({
                fileDescription: item.fileDescription,
                fileLabel: item.fileLabel || item.attachment,
                guid: item.guid
            }))
        };
        return DOBody;
    };
    const mappingIssueBodyParams = (params) => {
        const doDetailList = doDetailsState.rowDataDODetails;
        const externalAttachmentDoc = doDetailsState.rowDataExternalAttachment;
        const itemList = doDetailList?.map((e) => ({
            poUuid: e.poUuid,
            itemCode: e.itemCode,
            notesToBuyer: e.notesToBuyer,
            itemId: e?.itemId
        }));
        externalAttachmentDoc.forEach((item) => {
            if (!item.guid) {
                throw new Error("Please attach a file!");
            }
        });
        const currentAttachment = doDetailsState.documentList;
        const listDocDto = externalAttachmentDoc.filter((item) => currentAttachment
            .filter((value) => value.guid === item.guid).length === 0);
        const DOBody = {
            doUuid: doDetailsState.doUuid,
            deliveryDate: formatDateTime(params.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            itemList,
            documentList: listDocDto?.map((item) => ({
                fileDescription: item.fileDescription,
                fileLabel: item.fileLabel || item.attachment,
                guid: item.guid
            }))
        };
        return DOBody;
    };
    const createDO = async (params, currentCompanyUUID) => {
        try {
            const createDOBody = mappingCreateBodyParams(params);
            if (doDetailsState.enablePrefix) {
                createDOBody.deliveryOrderNumber = params.deliveryOrderNumber;
            }
            await itemSchema.validate(createDOBody.itemList);
            let sum = 0;
            for (let i = 0; i < createDOBody.itemList.length; i++) {
                sum = createDOBody.itemList[i].qtyToConvert + sum;
            }
            if (sum <= 0) {
                throw new Error("Deliver quantity must be greater than 0.");
            }
            const res = await DeliveryOrderService
                .createNewDeliveryOrder(currentCompanyUUID, createDOBody);
            const { data, message, status } = res.data;
            if (status === "OK") {
                try {
                    if (doDetailsState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: doDetailsState.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(currentCompanyUUID, conversationBody);
                    }
                    if (doDetailsState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: doDetailsState.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    }
                } catch (error) {}
                history.push(DO_ROUTES.DELIVERY_ORDER_LIST);
                showToast("success", message);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const issueDO = async (params, currentCompanyUUID) => {
        try {
            const createDOBody = mappingIssueBodyParams(params);
            const res = await DeliveryOrderService
                .issueDeliveryOrder(currentCompanyUUID, createDOBody);
            const { message, status } = res.data;
            if (status === "OK") {
                try {
                    if (doDetailsState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: createDOBody.doUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: doDetailsState.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(currentCompanyUUID, conversationBody);
                    }
                    if (doDetailsState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: createDOBody.doUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: doDetailsState.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    }
                } catch (error) {}
                history.push(DO_ROUTES.DELIVERY_ORDER_LIST);
                showToast("success", message || "Delivery order has been successfully updated");
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSavePressHandler = async (params) => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        switch (doStatus) {
        case DO_STATUS.CREATE_DO:
            createDO(params, currentCompanyUUID);
            break;
        case DO_STATUS.PENDING_ISSUE:
            issueDO(params, currentCompanyUUID);
            break;
        default:
            break;
        }
    };

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const onCellValueChanged = (params) => {
        setCellValueChange(params);
    };

    const onViewDOPressHandler = async () => {
        try {
            const {
                companyUuid,
                doUuid
            } = doDetailsState;

            const response = await DeliveryOrderService.viewPDF(
                companyUuid, doUuid
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { url } = data;
                if (url) {
                    window.open(url);
                }
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (cellValueChange) {
            const { data } = cellValueChange;
            if (doStatus === DO_STATUS.CREATE_DO) {
                data.completedDelivery = Number(clearNumber(data.poQtyReceived))
                    + Number(clearNumber(data.qtyToConvert))
                    === Number(clearNumber(data.poQuantity));
            }
            const changedData = [data];
            cellValueChange.api.applyTransaction({ update: changedData });
        }
    }, [cellValueChange]);

    useEffect(() => {
        if (doStatus !== DO_STATUS.CREATE_DO && doStatus !== DO_STATUS.PENDING_ISSUE) {
            gridColumnApi.setColumnsVisible(
                ["notesToBuyerIssued", "commentsOnDelivery", "documentFileLabel", "qtyRejected", "qtyReceived"], true
            );
            gridColumnApi.setColumnsVisible(
                ["notesToBuyer"], false
            );
            gridColumnApi.setColumnsPinned(
                ["completedDelivery", "notesToBuyer", "qtyToConvert", "addressLabel"], false
            );
        }
    }, [doStatus]);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const doUuid = query.get("uuid");
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        setDODetailsState((prevStates) => ({
            ...prevStates,
            doUuid,
            companyUuid: currentCompanyUUID
        }));
        if (!isNullOrUndefined(currentCompanyUUID) && currentCompanyUUID !== "") {
            if (location.pathname.includes("create-details")) {
                if (!isNullOrUndefined(location.state?.createDetail)) {
                    initDOCreateDetail(location.state?.createDetail, currentCompanyUUID);
                }
            } else {
                getDeliveryOrderDetails(doUuid, currentCompanyUUID);
            }
        }
    }, [userPermission]);

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => {
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(currentCompany)
                            && !_.isEmpty(userPermission)
                        ) {
                            const { supplier } = currentCompany;
                            setIsSupplier(supplier);
                            initData(setFieldValue);
                        }
                    }, [currentCompany, userPermission]);
                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col
                                    md={12}
                                    lg={12}
                                >

                                    <Row className="mb-2">
                                        <Col
                                            md={6}
                                            lg={6}
                                        >
                                            {
                                                location.pathname.includes("create-details") ? (
                                                    <HeaderMain
                                                        title={t("DeliveryOrder")}
                                                        className="mb-3 mb-lg-3"
                                                    />
                                                ) : (
                                                    <HeaderMain
                                                        title={t("DeliveryOrderDetails")}
                                                        className="mb-3 mb-lg-3"
                                                    />
                                                )
                                            }
                                        </Col>
                                        <Col className="d-flex justify-content-end align-items-center">
                                            {
                                                doStatus !== DO_STATUS.CREATE_DO
                                                && (
                                                    <Button
                                                        color="secondary"
                                                        onClick={() => onViewDOPressHandler()}
                                                        // disabled={doDetailsState.loading}
                                                        style={{ height: 40 }}
                                                    >
                                                        {t("View DO")}
                                                    </Button>
                                                )
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col
                                            md={6}
                                            lg={6}
                                        >
                                            <InitialSettingsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                enablePrefix={doDetailsState.enablePrefix}
                                            />
                                        </Col>

                                        <Col
                                            md={6}
                                            lg={6}
                                        >
                                            <GeneralInformationComponent
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
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail */}
                                    <DeliveryOrderDetailsTable
                                        rowData={doDetailsState.rowDataDODetails}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                            setGridColumnApi(params.columnApi);
                                        }}
                                        gridHeight={350}
                                        defaultExpanded
                                        borderTopColor="#AEC57D"
                                        onCellValueChanged={onCellValueChanged}
                                    />
                                </Col>
                            </Row>
                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    {!isSupplier
                                        && (
                                            <Conversation
                                                title={t("InternalConversations")}
                                                activeTab={doDetailsState.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setDODetailsState((prevStates) => ({
                                                        ...prevStates,
                                                        activeInternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={
                                                    (comment) => sendCommentConversation(
                                                        comment, true
                                                    )
                                                }
                                                addNewRowAttachment={
                                                    () => addNewRowAttachment(true)
                                                }
                                                rowDataConversation={
                                                    doDetailsState.rowDataInternalConversation
                                                }
                                                rowDataAttachment={
                                                    doDetailsState.rowDataInternalAttachment
                                                }
                                                onDeleteAttachment={
                                                    (uuid, rowData) => onDeleteAttachment(
                                                        uuid, rowData, true
                                                    )
                                                }
                                                onAddAttachment={
                                                    (e, uuid, rowData) => onAddAttachment(
                                                        e, uuid, rowData, true
                                                    )
                                                }
                                                onCellEditingStopped={
                                                    (params) => onCellEditingStopped(params, true)
                                                }
                                                defaultExpanded
                                            />
                                        )}
                                </Col>
                            </Row>
                            <Row className="mb-4">
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
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={
                                            doDetailsState.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            doDetailsState.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, false
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachment(
                                                e, uuid, rowData, false
                                            )
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, false)
                                        }
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
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
                                        rowData={doDetailsState.rowDataOverview}
                                        rowDataAuditTrail={doDetailsState.rowDataAuditTrail}
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
                                        activeTab={doDetailsState.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setDODetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={doDetailsState.companyUuid}
                                    />
                                </Col>
                            </Row>
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <Row className="mx-0">
                                        {doStatus === DO_STATUS.CREATE_DO
                                            && (
                                                <Button
                                                    color="primary"
                                                    className="mr-3"
                                                    type="button"
                                                    onClick={
                                                        () => {
                                                            handleSubmit();
                                                            if (!dirty || (dirty
                                                                && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onSavePressHandler(values, true);
                                                        }
                                                    }
                                                >
                                                    {t("Create")}
                                                </Button>
                                            )}
                                        {(doStatus === DO_STATUS.PENDING_ISSUE
                                            && (handleRolePermission?.write
                                                || handleRolePermission?.approve))
                                            && (
                                                <Button
                                                    color="primary"
                                                    className="mr-3"
                                                    type="button"
                                                    onClick={
                                                        () => {
                                                            handleSubmit();
                                                            if (!dirty || (dirty
                                                                && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onSavePressHandler(values, true);
                                                        }
                                                    }
                                                >
                                                    {t("Issue")}
                                                </Button>
                                            )}
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
export default DeliveryOrderDetails;
