import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useApprovalConfig } from "routes/hooks";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { convertToLocalTime, itemAttachmentSchema, convertDate2String } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, Blockchain, Overview } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import EntitiesService from "services/EntitiesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import {
    GoodsReceiptDetails,
    GeneralInfor,
    InitialSettings,
    SupplierInfor,
    ItemsOrderedPO
} from "../components";
import GR_CONSTANTS from "../constants/constants";
import GOODS_RECEIPT_ROUTES from "../route";
import { itemsOrderedPOSchema } from "../validation/validation";

const today = new Date();
today.setHours(0, 0, 0, 0);

const CreateGRFromPO = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const showToast = useToast();

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        minWidth: 300,
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
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        internalConversationLines: [],
        externalConversationLines: [],
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
        }
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
        grNumber: ""
    };

    const validationSchema = Yup.object().shape({
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
        deliveryDate: Yup.string()
            .required(t("PleaseSelectValidDeliveryDate")),
            // .test(
            //     "delivery-date-validation",
            //     t("DeliveryDateCannotBeInThePast"),
            //     (value) => {
            //         const date = new Date(value);
            //         return (!Number.isNaN(date.getTime())
            //                 && (new Date(value)).getTime() - today.getTime() >= 0);
            //     }
            // ),
        deliveryOrderNumber: Yup.string()
            .required(t("PleaseEnterValidDeliveryOrderNo"))
    });

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return type === "array" ? [] : {};
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
                            externalConversation: !isInternal
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

    const initData = async (currentCompanyUuid, poUuids) => {
        try {
            const responses = await Promise.allSettled([
                ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(currentCompanyUuid, "GR"),
                AddressDataService.getCompanyAddresses(currentCompanyUuid),
                ExtVendorService.getExternalVendors(currentCompanyUuid)
            ]);
            const [
                responseApprovalRoutes,
                responseAddresses,
                responseSuppliers
            ] = responses;

            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];
            const internalConversationResponses = await Promise.allSettled([
                ...poUuids?.map((poUuid) => ConversationService.getDetailInternalConversation(
                    currentCompanyUuid, poUuid
                ))
            ]);
            const externalConversationResponses = await Promise.allSettled([
                ...poUuids?.map((poUuid) => ConversationService.getDetailExternalConversation(
                    currentCompanyUuid, poUuid
                ))
            ]);

            rowDataExternalConversation = externalConversationResponses
                .map(
                    (externalConversation) => getDataConversation(
                        externalConversation, false
                    )
                ).flat();

            rowDataInternalConversation = internalConversationResponses
                .map(
                    (internalConversation) => getDataConversation(
                        internalConversation
                    )
                ).flat();

            setGRDetailsState((prevStates) => ({
                ...prevStates,
                approvalRoutes: getDataResponse(responseApprovalRoutes)?.filter((e) => e?.active),
                addresses: getDataResponse(responseAddresses),
                suppliers: getDataResponse(responseSuppliers),
                rowDataInternalConversation,
                rowDataExternalConversation
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
                deliveryOrderNumber: values.deliveryOrderNumber,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                procurementType: values.procurementType,
                items: [],
                itemNonPoDtos: [],
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            // if (rowDataItemsOrdered.length === 1) {
            //     await itemsOrderedPOSchema.validate(rowDataItemsOrdered);
            // }
            if (rowDataItemsOrdered.length > 1) {
                const listQtyReceiving = rowDataItemsOrdered.map((item) => item.qtyReceiving);
                // validate qtyReceiving > 0
                // if (listQtyReceiving.some((item) => item < 0)) {
                //     throw new Error(t("QuantityMustBeGreaterThanZero"));
                // }
                // validate at least one item have qtyReceiving > 0
                if (!listQtyReceiving.some((item) => item > 0)) {
                    throw new Error(t("AtLeastOneItemShouldHaveQtyReceiving"));
                }
                // validate qtyReceiving <= qtyPendingDelivery
                if (rowDataItemsOrdered.some(
                    (item) => item.qtyReceiving > item.qtyPendingDelivery
                )) {
                    throw new Error(t("QuantityReceivingCannotBeGreaterThanPendingDeliveryQuantity"));
                }
            }

            rowDataItemsOrdered.forEach((element) => {
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

            addedDocument = addedDocument.filter(
                (document) => document.fileDescription || document.fileLabel || document.guid
            );

            const goodsReceiptDocumentMetadata = addedDocument.map(
                ({
                    uuid, isNew, fileLabel, attachment, uploadedOn, ...rest
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
                deliveryOrderNumber: values.deliveryOrderNumber,
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

            // if (rowDataItemsOrdered.length === 1) {
            //     await itemsOrderedPOSchema.validate(rowDataItemsOrdered);
            // }
            if (rowDataItemsOrdered.length > 1) {
                const listQtyReceiving = rowDataItemsOrdered.map((item) => item.qtyReceiving);
                // validate qtyReceiving > 0
                // if (listQtyReceiving.some((item) => item < 0)) {
                //     throw new Error(t("QuantityMustBeGreaterThanZero"));
                // }
                // validate at least one item have qtyReceiving > 0
                if (!listQtyReceiving.some((item) => item > 0)) {
                    throw new Error(t("AtLeastOneItemShouldHaveQtyReceiving"));
                }
                // validate qtyReceiving <= qtyPendingDelivery
                if (rowDataItemsOrdered.some(
                    (item) => item.qtyReceiving > item.qtyPendingDelivery
                )) {
                    throw new Error(t("QuantityReceivingCannotBeGreaterThanPendingDeliveryQuantity"));
                }
            }

            rowDataItemsOrdered.forEach((element) => {
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

            addedDocument = addedDocument.filter(
                (document) => document.fileDescription || document.fileLabel || document.guid
            );

            const goodsReceiptDocumentMetadata = addedDocument.map(
                ({
                    uuid, isNew, fileLabel, attachment, uploadedOn, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.goodsReceiptDocumentMetadata = goodsReceiptDocumentMetadata;
            goodsReceiptDocumentMetadata.forEach((item) => {
                if (!item.guid) {
                    throw new Error("Please attach a file!");
                }
            });

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

    const onEditItemsOrdered = (params) => {
        setDirty();
        const { data } = params;
        const { rowDataItemsOrdered } = grDetailsState;
        const newRowData = [...rowDataItemsOrdered];

        rowDataItemsOrdered.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = data;
                newRowData[index].qtyReceiving = Number(data.qtyReceiving);
                const poDeliveryCompleted = (Number(data.qtyReceiving)
                    + Number(data.qtyReceived || 0) === data.quantity);
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
            rowData.forEach((row, index) => {
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

    const onChangeCheckbox = (e, rowData, data, params) => {
        const { target } = e;
        const { checked } = target;

        const newRowData = [...rowData];

        newRowData.forEach((item, index) => {
            if (item.uuid === data.uuid) {
                newRowData[index] = data;
                newRowData[index].poDeliveryCompleted = checked;
                if (checked) {
                    newRowData[index].qtyReceiving = data.qtyPendingDelivery;
                }
            }
        });

        params.api.setRowData(newRowData);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
        }));
    };

    useEffect(() => {
        const { companyUuid } = grDetailsState;
        if (companyUuid) {
            const { state } = location;
            const { data } = state;
            const { grDetails, poUuids } = data;
            const uuids = [
                ...grDetails?.ppoUuids || [],
                ...grDetails?.pprUuids || [],
                ...grDetails?.prUuids || [],
                ...poUuids || []
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
            initData(companyUuid, newArr);
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
                                items,
                                supplier,
                                procurementType,
                                supplierCompanyUuid,
                                documents
                            } = grDetails;
                            setFieldValue("isEdit", true);
                            setFieldValue("grType", GR_CONSTANTS.PO);
                            setFieldValue("deliveryOrderNumber", "");
                            setFieldValue("deliveryDate", "");
                            setFieldValue("supplierCode", supplier.companyCode);
                            setFieldValue("supplierName", supplier.companyName);
                            setFieldValue("contactName", supplier.contactPersonName);
                            setFieldValue("contactEmail", supplier.contactPersonEmail);
                            setFieldValue("contactNumber", supplier.contactPersonNumber);
                            setFieldValue("country", supplier.countryOfOrigin);
                            setFieldValue("supplierCompanyUuid", supplierCompanyUuid);
                            setFieldValue("companyRegNo", supplier.uen);
                            setFieldValue("countryCode", supplier.countryCode);
                            setFieldValue("procurementType", procurementType);

                            const rowDataItemsOrdered = items.map(
                                (item) => ({
                                    address: item.deliveryAddress,
                                    commentsOnDelivery: "",
                                    poNumber: item.poNumber,
                                    itemCode: item.itemCode,
                                    itemBrand: item.itemBrand,
                                    itemDescription: item.itemDescription,
                                    itemModel: item.itemModel,
                                    itemName: item.itemName,
                                    itemSize: item.itemSize,
                                    uomCode: item.uomCode,
                                    quantity: item.quantity,
                                    qtyReceived: item.qtyReceived,
                                    qtyPendingDelivery: item.pendingDeliveryQty,
                                    qtyReceiving: 0,
                                    itemId: item.itemId,
                                    poNote: item.poNote || item.note,
                                    uuid: uuidv4()
                                })
                            );

                            const rowDataInternalAttachment = documents.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(
                                ({
                                    description,
                                    fileName,
                                    uploadBy,
                                    uploadOn,
                                    ...rest
                                }) => ({
                                    ...rest,
                                    fileLabel: fileName,
                                    fileDescription: description,
                                    uploadedOn: convertToLocalTime(
                                        uploadOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    uploadedBy: uploadBy
                                })
                            );

                            const rowDataExternalAttachment = documents.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(
                                ({
                                    description,
                                    fileName,
                                    uploadBy,
                                    uploadOn,
                                    ...rest
                                }) => ({
                                    ...rest,
                                    fileLabel: fileName,
                                    fileDescription: description,
                                    uploadedOn: convertToLocalTime(
                                        uploadOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    uploadedBy: uploadBy
                                })
                            );

                            setGRDetailsState((prevStates) => ({
                                ...prevStates,
                                rowDataItemsOrdered,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment
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
                                                title={t("CreateReceiptFromPO")}
                                                className="mb-3 mb-lg-3"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <GoodsReceiptDetails
                                                t={t}
                                                options={grDetailsState.grTypes}
                                                handleChange={handleChange}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                            />
                                            <InitialSettings
                                                t={t}
                                                disabled
                                                options={[]}
                                                setFieldValue={setFieldValue}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                type="PO"
                                                approvalRoutes={grDetailsState.approvalRoutes}
                                                onChangeApprovalRoute={(e) => {
                                                    onChangeApprovalRoute(e, setFieldValue);
                                                }}
                                                modeView={grDetailsState.modeView}
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
                                    <ItemsOrderedPO
                                        t={t}
                                        rowDataItem={grDetailsState.rowDataItemsOrdered}
                                        onDeleteItem={() => { }}
                                        onCellValueChanged={(params) => onEditItemsOrdered(params)}
                                        onAddAttachment={(e, uuid, rowData) => {
                                            onAddAttachment(e, uuid, rowData);
                                        }}
                                        onChangePODeliveryCompleted={(e, rowData, data, params) => {
                                            onChangeCheckbox(e, rowData, data, params);
                                        }}
                                        onDeleteFile={(uuid, rowData, params) => {
                                            onDeleteFile(uuid, rowData, params);
                                        }}
                                        defaultExpanded
                                        modeView={grDetailsState.modeView}
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

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
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
                                            disabled={isSubmitting}
                                            type="button"
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
                                            disabled={isSubmitting}
                                            type="button"
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
export default CreateGRFromPO;
