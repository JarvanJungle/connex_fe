import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useApprovalConfig } from "routes/hooks";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { convertToLocalTime, itemAttachmentSchema, minusToPrecise } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, Blockchain, Overview } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import EntitiesService from "services/EntitiesService";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import {
    GoodsReceiptDetails,
    GeneralInfor,
    InitialSettings,
    SupplierInfor,
    ItemsOrderedDO
} from "../components";
import GR_CONSTANTS from "../constants/constants";
import GOODS_RECEIPT_ROUTES from "../route";

const CreateGRFromDO = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const showToast = useToast();
    const requestFormRef = useRef(null);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true }
    };

    const [grDetailsState, setGRDetailsState] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        activeAuditTrailTab: 1,
        addresses: [],
        suppliers: [],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        grTypes: [
            { label: "DO", value: GR_CONSTANTS.DO },
            { label: "PO", value: GR_CONSTANTS.PO },
            { label: "Non-PO", value: GR_CONSTANTS.NON_PO }
        ],
        rowDataExternalConversation: [],
        rowDataInternalConversation: [],
        internalConversationLines: [],
        externalConversationLines: [],
        externalConversationLinesDO: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        rowDataOverview: [],
        rowDataItemsOrdered: [],
        grDetails: { },
        approvalRoutes: [],
        modeView: {
            isEditMode: true,
            isViewDetailsMode: false,
            isApprovalMode: false
        },
        enablePrefix: false
    });
    const approvalConfig = useApprovalConfig(FEATURE.GR);

    const initialValues = {
        approvalConfig: false,
        isEdit: false,
        grType: "",
        deliveryOrderNumber: "",
        grStatus: "",
        deliveryDate: "",
        supplierCode: "",
        supplierName: "",
        contactName: "",
        contactEmail: "",
        contactNumber: "",
        country: "",
        companyRegNo: "",
        countryCode: "",
        procurementType: "",
        approvalRoute: "",
        approvalSequence: "",
        grNumber: "",
        enablePrefix: false
    };

    const ONE_DATE_MS = 86400000;

    const validationSchema = Yup.object().shape({
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
        deliveryDate: Yup.date()
            // .min(new Date(Date.now() - ONE_DATE_MS), t("PleaseSelectValidDeliveryDateThanToday"))
            .required(t("PleaseSelectValidDeliveryDate")),
        grNumber: Yup.string()
            .test(
                "doRequired",
                t("PleaseSelectValidGRNumber"),
                (value, testContext) => {
                    const { parent } = testContext;
                    if (parent.enablePrefix && !value) {
                        return false;
                    }
                    return true;
                }
            )
    });

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const initData = async (companyUuid, uuids, supplierCompanyUuid, doUuids) => {
        try {
            const approvalRoutes = (await ApprovalMatrixManagementService
                .retrieveListOfApprovalMatrixDetails(
                    companyUuid, "GR"
                ))?.data?.data?.filter((e) => e.active);

            const rowDataExternalConversation = [];
            const rowDataInternalConversation = [];
            const externalConversationLinesDO = [];
            await Promise.all(
                uuids?.map(async (doUuid) => {
                    const response = await ConversationService.getDetailInternalConversation(
                        companyUuid, doUuid
                    );
                    const { data } = response && response.data;
                    if (data) {
                        response?.data?.data?.conversations
                            .forEach((item) => {
                                rowDataInternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation || "Supplier",
                                    userUuid: item.userUuid,
                                    dateTime: convertToLocalTime(new Date(item.date),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                            });
                    }
                })
            );
            await Promise.all(
                uuids?.map(async (doUuid) => {
                    const response = await ConversationService.getDetailExternalConversation(
                        companyUuid, doUuid
                    );
                    const { data } = response && response.data;
                    if (data) {
                        response?.data?.data?.conversations
                            .forEach((item) => {
                                rowDataExternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation || "Supplier",
                                    userUuid: item.userUuid,
                                    dateTime: convertToLocalTime(new Date(item.createdAt),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                                externalConversationLinesDO.push({
                                    text: item.text,
                                    userUuid: item.userUuid
                                });
                            });
                    }
                }),
                doUuids?.map(async (doUuid) => {
                    const response = await ConversationService.getDetailExternalConversation(
                        supplierCompanyUuid, doUuid
                    );
                    const { data } = response && response.data;
                    if (data) {
                        response?.data?.data?.conversations
                            .forEach((item) => {
                                rowDataExternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation || "Supplier",
                                    userUuid: item.userUuid,
                                    dateTime: convertToLocalTime(new Date(item.createdAt),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                                externalConversationLinesDO.push({
                                    text: item.text,
                                    userUuid: item.userUuid
                                });
                            });
                    }
                })
            );
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                approvalRoutes,
                rowDataExternalConversation,
                rowDataInternalConversation,
                externalConversationLinesDO
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        const { companyUuid } = grDetailsState;
        setFieldValue("approvalRoute", value);
        try {
            const response = await ApprovalMatrixManagementService
                .getApprovalMatrixByApprovalUuid(companyUuid, value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { approvalRange } = data;
                let approvalSequence = "";
                approvalRange.forEach((approval, index) => {
                    const { approvalGroups } = approval;
                    if (index === 0) {
                        approvalSequence = approvalGroups[0].group.groupName;
                    } else {
                        approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
                    }
                });
                setFieldValue("approvalSequence", approvalSequence);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCreatePressHandler = async (values) => {
        setPristine();
        try {
            const {
                rowDataItemsOrdered,
                companyUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = grDetailsState;

            const body = {
                grType: values.grType,
                grNumber: values.grNumber,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                items: [],
                itemNonPoDtos: [],
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            rowDataItemsOrdered.forEach((element) => {
                if (element.qtyToConvert < element.qtyReceiving) {
                    throw Error("Quantity Receiving cannot be greater than Delivery Order Quantity");
                }
                const item = {
                    qtyReceiving: Number(element.qtyReceiving),
                    itemId: element.itemId,
                    commentOnDelivery: element.commentsOnDelivery,
                    documentLabel: element.documentFileLabel,
                    attachment: element.documentGuid
                };
                if (!item.documentLabel) delete item.documentLabel;
                if (!item.attachment) delete item.attachment;

                body.items.push(item);
            });

            let addedDocument = rowDataInternalAttachment
                .concat(rowDataExternalAttachment);
            addedDocument = addedDocument.filter(
                (document) => document.isNew === true
            );

            await itemAttachmentSchema.validate(addedDocument);

            const goodsReceiptDocumentMetadata = addedDocument.map(
                ({
                    attachment, fileLabel, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.goodsReceiptDocumentMetadata = goodsReceiptDocumentMetadata;

            const response = await GoodsReceiptService.submitGR(companyUuid, body);

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                try {
                    if (grDetailsState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: grDetailsState.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (grDetailsState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: grDetailsState.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(GOODS_RECEIPT_ROUTES.GR_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSaveAsDraftPressHandler = async (values) => {
        setPristine();
        try {
            const {
                rowDataItemsOrdered,
                companyUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = grDetailsState;

            const body = {
                grType: values.grType,
                grNumber: values.grNumber,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                items: [],
                itemNonPoDtos: [],
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            rowDataItemsOrdered.forEach((element) => {
                if (element.qtyToConvert < element.qtyReceiving) {
                    throw Error("Quantity Receiving cannot be greater than Delivery Order Quantity");
                }
                const item = {
                    qtyReceiving: Number(element.qtyReceiving),
                    itemId: element.itemId,
                    commentOnDelivery: element.commentsOnDelivery,
                    documentLabel: element.documentFileLabel,
                    attachment: element.documentGuid
                };
                if (!item.documentLabel) delete item.documentLabel;
                if (!item.attachment) delete item.attachment;

                body.items.push(item);
            });

            let addedDocument = rowDataInternalAttachment
                .concat(rowDataExternalAttachment);
            addedDocument = addedDocument.filter(
                (document) => document.isNew === true
            );

            await itemAttachmentSchema.validate(addedDocument);

            const goodsReceiptDocumentMetadata = addedDocument.map(
                ({
                    fileLabel, attachment, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.goodsReceiptDocumentMetadata = goodsReceiptDocumentMetadata;

            const response = await GoodsReceiptService.saveAsDraftGR(companyUuid, body);

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                try {
                    if (grDetailsState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: grDetailsState.externalConversationLines
                        };
                        await ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (grDetailsState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: grDetailsState.internalConversationLines
                        };
                        await ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(GOODS_RECEIPT_ROUTES.GR_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onEditItemsOrdered = (params) => {
        setDirty();
        const { data } = params;
        const { rowDataItemsOrdered } = grDetailsState;
        const newRowData = [...rowDataItemsOrdered];

        rowDataItemsOrdered.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = data;
                newRowData[index].qtyRejecting = minusToPrecise(
                    data.qtyToConvert, data.qtyReceiving
                );
                const poDeliveryCompleted = (Number(data.qtyReceiving)
                + Number(data.qtyReceived || 0) === data.poQuantity);
                newRowData[index].poDeliveryCompleted = poDeliveryCompleted;
            }
        });

        params.api.setRowData(newRowData);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
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

    const onAddAttachment = (event, uuid, rowData) => {
        setDirty();
        handleFileUpload(event).then((result) => {
            if (!result) return;

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        documentGuid: result.guid,
                        documentFileLabel: result.fileLabel
                    };
                }
            });
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                rowDataItemsOrdered: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const prefixStatus = async (currentCompanyUUID) => {
        let enablePrefix = false;
        const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
        if (response.data.status === "OK") {
            const { data } = response.data;
            data.supplierPortalList.forEach((item) => {
                if (item.functionName === "Goods Receipt" && item.type === "Manual") {
                    enablePrefix = true;
                }
            });
        } else {
            throw new Error(response.data.message);
        }
        requestFormRef?.current?.setFieldValue("enablePrefix", enablePrefix);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            enablePrefix
        }));
    };

    useEffect(() => {
        const { companyUuid } = grDetailsState;
        if (companyUuid) {
            const { state } = location;
            const { data } = state;
            const { grDetails, doUuids } = data;
            const { supplierCompanyUuid } = grDetails && grDetails.supplierInfo;
            const uuids = [
                ...grDetails?.ppoUuids || [],
                ...grDetails?.poUuids || [],
                ...grDetails?.pprUuids || [],
                ...grDetails?.prUuids || []
            ];
            const listUuids = uuids?.filter((item) => item);
            const newArr = [];
            listUuids?.forEach((item) => {
                if (!newArr.includes(item)) {
                    newArr.push(item);
                }
            });
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                grDetails
            }));
            prefixStatus(companyUuid);
            initData(companyUuid, newArr, supplierCompanyUuid, doUuids);
        }
    }, [grDetailsState.companyUuid]);

    useEffect(() => {
        if (currentCompany && !_.isEmpty(userDetails)) {
            const { companyUuid } = currentCompany;
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                companyUuid
            }));
        }
    }, [currentCompany, userDetails]);

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const internalConversationLines = [...grDetailsState.internalConversationLines];
            const { rowDataInternalConversation } = grDetailsState;
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
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = grDetailsState;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...grDetailsState.externalConversationLines];
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
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
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

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = grDetailsState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                isNew: true,
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: new Date(),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4()
            });
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = grDetailsState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            isNew: true,
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: new Date(),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4()
        });
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = grDetailsState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = grDetailsState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onAddAttachmentConversation = (event, uuid, rowData, isInternal) => {
        setDirty();
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
                setGRDetailsState((prevStates) => ({
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
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };
    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        setDirty();
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setGRDetailsState((prevStates) => ({
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
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onDeleteFile = async (uuid, rowData, params) => {
        setDirty();
        const data = rowData.find((item) => item.uuid === uuid);
        const { documentGuid } = data;
        let newRowData = [...rowData];
        if (documentGuid) {
            await handelDeleteFile(documentGuid);
        }
        newRowData = newRowData.map(
            (item) => {
                if (item.uuid === uuid) {
                    const newItem = { ...item };
                    delete newItem.documentGuid;
                    delete newItem.documentFileLabel;
                    return newItem;
                }
                return item;
            }
        );
        params.api.setRowData(newRowData);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
        }));
    };

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        actions.setSubmitting(false);
                    }, 1000);
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, isSubmitting, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (!_.isEmpty(grDetailsState.grDetails)) {
                            const { grDetails } = grDetailsState;
                            const {
                                deliveryOderNumbers,
                                items,
                                supplierInfo,
                                procurementType,
                                documentList,
                                internalDocumentList
                            } = grDetails;
                            setFieldValue("deliveryOrderNumber", deliveryOderNumbers.join(", "));
                            if (supplierInfo) {
                                setFieldValue("supplierCode", supplierInfo?.companyCode);
                                setFieldValue("supplierName", supplierInfo?.companyName);
                                setFieldValue("contactName", supplierInfo?.contactPersonName);
                                setFieldValue("contactEmail", supplierInfo?.contactPersonEmail);
                                setFieldValue("contactNumber", supplierInfo?.contactPersonNumber);
                                setFieldValue("country", supplierInfo?.country);
                                setFieldValue("companyRegNo", supplierInfo?.uen);
                                setFieldValue("countryCode", supplierInfo?.countryCode);
                                setFieldValue("supplierCompanyUuid", supplierInfo?.supplierCompanyUuid);
                            }

                            setFieldValue("isEdit", true);
                            setFieldValue("grType", GR_CONSTANTS.DO);
                            setFieldValue("deliveryOrderNumber", deliveryOderNumbers.join(", "));
                            setFieldValue("procurementType", procurementType);

                            const rowDataItemsOrdered = items.map(
                                ({ qtyToConvert, ...item }) => ({
                                    ...item,
                                    qtyToConvert,
                                    qtyRejecting: qtyToConvert,
                                    uuid: uuidv4(),
                                    commentsOnDelivery: ""
                                })
                            );

                            const rowDataExternalAttachment = documentList.map(
                                ({ uploadedByName, uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    uploadedBy: uploadedByName
                                })
                            );

                            const rowDataInternalAttachment = internalDocumentList?.map(
                                ({ uploadedByName, uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    uploadedBy: uploadedByName
                                })
                            ) || [];

                            setGRDetailsState((prevStates) => ({
                                ...prevStates,
                                rowDataItemsOrdered,
                                rowDataExternalAttachment,
                                rowDataInternalAttachment
                            }));
                        }
                    }, [grDetailsState.grDetails]);

                    useEffect(() => {
                        if (values.approvalRoute
                            || values.deliveryOrderNumber
                            || values.deliveryDate
                        ) {
                            setDirty();
                        }
                    }, [values]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={12} lg={12}>
                                            <HeaderMain
                                                title={t("CreateReceiptFromDO")}
                                                className="mb-3 mb-lg-3"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <GoodsReceiptDetails
                                                t={t}
                                                disabled
                                                options={grDetailsState.grTypes}
                                                handleChange={handleChange}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                type="text"
                                            />
                                            <InitialSettings
                                                t={t}
                                                disabled
                                                options={[]}
                                                setFieldValue={setFieldValue}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                type="DO"
                                                approvalRoutes={grDetailsState.approvalRoutes}
                                                onChangeApprovalRoute={(e) => {
                                                    onChangeApprovalRoute(e, setFieldValue);
                                                }}
                                                modeView={grDetailsState.modeView}
                                                tooltipOpen={tooltipOpen}
                                                toggle={toggle}
                                                enablePrefix={grDetailsState.enablePrefix}
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <GeneralInfor
                                                t={t}
                                                values={values}
                                                procurementTypes={grDetailsState.procurementTypes}
                                                handleChange={handleChange}
                                                modeView={grDetailsState.modeView}
                                            />
                                            <SupplierInfor
                                                t={t}
                                                disabled
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                modeView={grDetailsState.modeView}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("ItemsOrdered")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <ItemsOrderedDO
                                        t={t}
                                        rowDataItem={grDetailsState.rowDataItemsOrdered}
                                        onDeleteItem={() => { }}
                                        onCellValueChanged={(params) => onEditItemsOrdered(params)}
                                        onAddAttachment={(e, uuid, rowData) => {
                                            onAddAttachment(e, uuid, rowData);
                                        }}
                                        onDeleteFile={(uuid, rowData, params) => {
                                            onDeleteFile(uuid, rowData, params);
                                        }}
                                        defaultExpanded
                                        modeView={grDetailsState.modeView}
                                        companyUuid={grDetailsState.companyUuid}
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Blockchain
                                        defaultExpanded
                                        borderTopColor="#fff"
                                        rowDataHashes={[]}
                                        rowDataDocuments={[]}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    <Conversation
                                        title={t("InternalConversations")}
                                        activeTab={grDetailsState.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setGRDetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, true)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={
                                            grDetailsState.rowDataInternalConversation
                                        }
                                        rowDataAttachment={
                                            grDetailsState.rowDataInternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, true
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachmentConversation(
                                                e, uuid, rowData, true
                                            )
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, true)
                                        }
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={grDetailsState.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setGRDetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={
                                            grDetailsState.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            grDetailsState.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, false
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachmentConversation(
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

                            <Row className="mb-5">
                                <Col xs={12}>
                                    <Overview
                                        rowData={grDetailsState.rowDataOverview}
                                        rowDataAuditTrail={grDetailsState.rowDataAuditTrail}
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
                                        activeTab={grDetailsState.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setGRDetailsState((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={grDetailsState.companyUuid}
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
                                        <Button
                                            color="secondary"
                                            type="button"
                                            disabled={isSubmitting}
                                            className="mr-3"
                                            onClick={
                                                () => {
                                                    handleSubmit();
                                                    if (!dirty
                                                        || (dirty && Object.keys(errors).length)) {
                                                        showToast("error", "Validation error, please check your input.");
                                                        return;
                                                    }
                                                    onSaveAsDraftPressHandler(values);
                                                }
                                            }
                                        >
                                            {t("SaveAsDraft")}
                                        </Button>
                                        <Button
                                            color="primary"
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={
                                                () => {
                                                    handleSubmit();
                                                    if (!dirty
                                                        || (dirty && Object.keys(errors).length)) {
                                                        showToast("error", "Validation error, please check your input.");
                                                        return;
                                                    }
                                                    onCreatePressHandler(values);
                                                }
                                            }
                                        >
                                            {t("Create")}
                                        </Button>
                                    </Row>
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};
export default CreateGRFromDO;
