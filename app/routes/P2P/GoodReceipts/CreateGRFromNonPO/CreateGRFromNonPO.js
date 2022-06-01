import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { useApprovalConfig } from "routes/hooks";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { convertToLocalTime, itemAttachmentSchema } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import {
    Conversation, Blockchain, Overview, AddItemDialog
} from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory } from "react-router";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import EntitiesService from "services/EntitiesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { CatalogueItemColDefs } from "routes/P2P/PurchaseRequest/ColumnDefs";
import CatalogueService from "services/CatalogueService";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import UOMDataService from "services/UOMService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import {
    GoodsReceiptDetails,
    GeneralInfor,
    SupplierInfor,
    ItemsOrderedNonPO
} from "../components";
import InitialSettings from "./components/InitialSettings";
import GOODS_RECEIPT_ROUTES from "../route";
import GR_CONSTANTS from "../constants/constants";
import { itemsOrderedNonPOSchema } from "../validation/validation";

const today = new Date();
today.setHours(0, 0, 0, 0);

const CreateGRFromNonPO = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const showToast = useToast();

    const getDataPath = (data) => data.documentType;
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

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
        internalConversationLines: [],
        externalConversationLines: [],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        rowDataOverview: [],
        rowDataItemsOrdered: [],
        approvalRoutes: [],
        catalogueItems: [],
        selectedCatalogueItems: [],
        listCatalogueBySupplier: [],
        showAddCatalogue: false,
        uoms: [],
        modeView: {
            isEditMode: true,
            isViewDetailsMode: false,
            isApprovalMode: false
        }
    });
    const [itemDeleted, setItemDeleted] = useState("");
    const approvalConfig = useApprovalConfig(FEATURE.GR);

    const initialValues = {
        approvalConfig: false,
        isEdit: true,
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
        supplierUuid: ""
    };

    const validationSchema = Yup.object().shape({
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
        supplierCode: Yup.string()
            .required(t("PleaseSelectValidSupplier")),
        deliveryDate: Yup.string()
            .required(t("PleaseSelectValidDeliveryDate")),
            // .test(
            //     "delivery-date-validation",
            //     t("DeliveryDateCannotBeInThePast"),
            //     (value) => {
            //         const date = new Date(value);
            //         return (!Number.isNaN(date.getTime())
            //             && (new Date(value)).getTime() - today.getTime() >= 0);
            //     }
            // ),
        deliveryOrderNumber: Yup.string()
            .required(t("PleaseEnterValidDeliveryOrderNo"))
    });

    const initData = async (companyUuid) => {
        try {
            const approvalRoutes = (await ApprovalMatrixManagementService
                .retrieveListOfApprovalMatrixDetails(
                    companyUuid, "GR"
                ))?.data?.data?.filter((e) => e.active);

            const responseAddresses = await AddressDataService.getCompanyAddresses(
                companyUuid
            );

            const responseSuppliers = await ExtVendorService.getExternalVendors(
                companyUuid
            );
            const suppliers = responseSuppliers?.data?.data.sort((a, b) => {
                if (a.companyCode < b.companyCode) return -1;
                if (a.companyCode > b.companyCode) return 1;
                return 0;
            });

            const catalogueItems = [];

            const responseUOMs = await UOMDataService.getUOMRecords(
                companyUuid
            );

            setGRDetailsState((prevStates) => ({
                ...prevStates,
                approvalRoutes,
                addresses: responseAddresses.data.data,
                suppliers,
                catalogueItems,
                listCatalogueBySupplier: catalogueItems,
                uoms: responseUOMs.data.data
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
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                supplier: {
                    companyCode: values.supplierCode,
                    companyName: values.supplierName,
                    contactPersonName: values.contactName,
                    contactPersonEmail: values.contactEmail,
                    contactPersonWorkNumber: values.contactNumber,
                    countryCode: values.countryCode,
                    companyRegNo: values.companyRegNo,
                    countryOfOrigin: values.country,
                    uuid: values.supplierUuid
                },
                items: [],
                itemNonPoDtos: [],
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            rowDataItemsOrdered.forEach((item) => {
                const {
                    currencyCode,
                    supplierCode,
                    address,
                    manualItem,
                    uuid,
                    quantity,
                    uomCode,
                    ...rest
                } = item;
                const newItem = {
                    ...rest,
                    address: {
                        addressLabel: address?.addressLabel,
                        addressFirstLine: address?.addressFirstLine,
                        addressSecondLine: address?.addressSecondLine,
                        city: address?.city,
                        state: address?.state,
                        country: address?.country,
                        postalCode: address?.postalCode
                    },
                    qtyReceiving: Number(quantity),
                    commentOnDelivery: item.commentsOnDelivery,
                    documentLabel: item.documentFileLabel,
                    attachment: item.documentGuid,
                    uomCode: typeof uomCode === "string" ? uomCode
                        : uomCode?.uomCode
                };

                if (!newItem.documentLabel) delete newItem.documentLabel;
                if (!newItem.attachment) delete newItem.attachment;
                if (!newItem.address.addressLabel) newItem.address = {};

                body.itemNonPoDtos.push(newItem);
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

            await itemsOrderedNonPOSchema.validate(body.itemNonPoDtos);

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
                approvalRouteUuid: values.approvalRoute,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                deliveryOrderNumber: values.deliveryOrderNumber,
                supplier: {
                    companyCode: values.supplierCode,
                    companyName: values.supplierName,
                    contactPersonName: values.contactName,
                    contactPersonEmail: values.contactEmail,
                    contactPersonWorkNumber: values.contactNumber,
                    countryCode: values.countryCode,
                    companyRegNo: values.companyRegNo,
                    countryOfOrigin: values.country,
                    uuid: values.supplierUuid
                },
                items: [],
                itemNonPoDtos: [],
                goodsReceiptDocumentMetadata: []
            };

            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            rowDataItemsOrdered.forEach((item) => {
                const {
                    currencyCode,
                    supplierCode,
                    address,
                    manualItem,
                    uuid,
                    quantity,
                    uomCode,
                    ...rest
                } = item;
                const newItem = {
                    ...rest,
                    address: {
                        addressLabel: address?.addressLabel,
                        addressFirstLine: address?.addressFirstLine,
                        addressSecondLine: address?.addressSecondLine,
                        city: address?.city,
                        state: address?.state,
                        country: address?.country,
                        postalCode: address?.postalCode
                    },
                    qtyReceiving: Number(quantity),
                    commentOnDelivery: item.commentsOnDelivery,
                    documentLabel: item.documentFileLabel,
                    attachment: item.documentGuid,
                    uomCode: typeof uomCode === "string" ? uomCode
                        : uomCode?.uomCode
                };

                if (!newItem.documentLabel) delete newItem.documentLabel;
                if (!newItem.attachment) delete newItem.attachment;
                if (!newItem.address.addressLabel) newItem.address = {};

                body.itemNonPoDtos.push(newItem);
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

            await itemsOrderedNonPOSchema.validate(body.itemNonPoDtos);

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

    const addItemReqManual = () => {
        setDirty();
        const { rowDataItemsOrdered } = grDetailsState;
        const newRowData = [...rowDataItemsOrdered];
        newRowData.push({
            uuid: uuidv4(),
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            uomCode: "",
            address: "",
            commentsOnDelivery: "",
            quantity: 0,
            manualItem: true
        });
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
        }));
    };

    const onAddNewItemCatalogue = () => {
        setDirty();
        const {
            rowDataItemsOrdered,
            addresses,
            listCatalogueBySupplier,
            selectedCatalogueItems
        } = grDetailsState;
        const newCatalogueItems = [...listCatalogueBySupplier];
        const newRowData = [...rowDataItemsOrdered];
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            showAddCatalogue: false
        }));
        selectedCatalogueItems.forEach((node) => {
            const { data } = node;
            newCatalogueItems.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === data.catalogueItemCode
                        && item.supplierCode === data.supplierCode
                        && item.currencyCode === data.currencyCode
                    ) {
                        newCatalogueItems[index].isSelected = true;
                    }
                }
            );

            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uomCode: data.uomCode,
                address: addresses[0],
                commentsOnDelivery: "",
                quantity: 0,
                manualItem: false,
                supplierCode: data.supplierCode,
                currencyCode: data.currencyCode
            };

            newRowData.push(itemRequest);
        });
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData,
            selectedCatalogueItems: [],
            listCatalogueBySupplier: newCatalogueItems
        }));
    };

    const onDeleteItem = (uuid, rowData, params) => {
        const { data } = params;
        const newRowData = rowData.filter((item) => item.uuid !== uuid);
        params.api.setRowData(newRowData);
        setItemDeleted(data);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
        }));
    };

    useEffect(() => {
        const { companyUuid } = grDetailsState;
        if (companyUuid) {
            initData(companyUuid);
        }
    }, [grDetailsState.companyUuid]);

    useEffect(() => {
        if (!_.isEmpty(userDetails)
            && currentCompany) {
            const { companyUuid } = currentCompany;
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                companyUuid
            }));
        }
    }, [permissionReducer, userDetails]);

    useEffect(() => {
        if (itemDeleted) {
            const { listCatalogueBySupplier } = grDetailsState;
            const newCatalogueItems = [...listCatalogueBySupplier];
            newCatalogueItems.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === itemDeleted.itemCode
                        && item.currencyCode === itemDeleted.currencyCode
                        && item.supplierCode === itemDeleted.supplierCode
                    ) {
                        newCatalogueItems[index].isSelected = false;
                    }
                }
            );
            setGRDetailsState((prevStates) => ({
                ...prevStates,
                listCatalogueBySupplier: newCatalogueItems
            }));
        }
    }, [itemDeleted.itemCode]);

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
                initialValues={initialValues}
                onSubmit={() => { }}
                validationSchema={validationSchema}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        setFieldValue("grType", GR_CONSTANTS.NON_PO);
                        setFieldValue("procurementType", "Goods");
                    }, []);

                    useEffect(() => {
                        if (values.approvalRoute
                            || values.deliveryOrderNumber
                            || values.deliveryDate
                            || values.supplierCode
                        ) {
                            setDirty();
                        }
                    }, [values]);

                    useEffect(() => {
                        if (values.supplierCode) {
                            if (values.supplierCode) {
                                const { catalogueItems } = grDetailsState;
                                const listCatalogueBySupplier = catalogueItems.filter((item) => (
                                    !item.supplierCode || values.supplierCode === item.supplierCode
                                ));

                                setGRDetailsState((prevStates) => ({
                                    ...prevStates,
                                    listCatalogueBySupplier
                                }));
                            } else {
                                setGRDetailsState((prevStates) => ({
                                    ...prevStates,
                                    listCatalogueBySupplier: grDetailsState.catalogueItems
                                }));
                            }
                        }
                    }, [values.supplierCode]);

                    const catalogueBEServerConfig = useMemo(() => ({
                        dataField: "catalogues",
                        getDataFunc: (query) => CatalogueService
                            .getCataloguesV2(grDetailsState.companyUuid, {
                                ...query,
                                supplier: ["GENERIC", values?.supplierUuid].join(",")
                            }).then(({ data: { data } }) => data)
                    }), [values?.supplierUuid]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={12} lg={12}>
                                            <HeaderMain
                                                title={t("CreateNonOrderReceipt")}
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
                                                setFieldValue={setFieldValue}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
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
                                                disabled={!values.isEdit}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                setFieldValue={setFieldValue}
                                                suppliers={grDetailsState.suppliers}
                                                companyUuid={grDetailsState.companyUuid}
                                                modeView={grDetailsState.modeView}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mb-2 mx-0 justify-content-between">
                                <HeaderSecondary
                                    title={t("ItemsOrdered")}
                                />
                                <div className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        onClick={() => addItemReqManual()}
                                        className="mr-1"
                                    >
                                        <i className="mr-1 fa fa-plus" />
                                        <span>{t("AddManual")}</span>
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setGRDetailsState((prevStates) => ({
                                                ...prevStates,
                                                showAddCatalogue: true
                                            }));
                                        }}
                                        className="mr-1"
                                    >
                                        <i className="mr-1 fa fa-plus" />
                                        <span>{t("AddCatalogue")}</span>
                                    </Button>
                                </div>
                            </Row>
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <ItemsOrderedNonPO
                                        t={t}
                                        rowDataItem={grDetailsState.rowDataItemsOrdered}
                                        onCellValueChanged={(params) => onEditItemsOrdered(params)}
                                        onAddAttachment={(e, uuid, rowData) => {
                                            onAddAttachment(e, uuid, rowData);
                                        }}
                                        onDeleteItem={(uuid, rowData, params) => {
                                            onDeleteItem(uuid, rowData, params);
                                        }}
                                        onDeleteFile={(uuid, rowData, params) => {
                                            onDeleteFile(uuid, rowData, params);
                                        }}
                                        defaultExpanded
                                        disabled={false}
                                        addresses={grDetailsState.addresses}
                                        uoms={grDetailsState.uoms}
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

                            {/* Add Catalogue Dialog */}
                            <AddItemDialog
                                isShow={grDetailsState.showAddCatalogue}
                                onHide={() => {
                                    setGRDetailsState((prevStates) => ({
                                        ...prevStates,
                                        showAddCatalogue: false,
                                        selectedCatalogueItems: []
                                    }));
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemCatalogue()}
                                onNegativeAction={() => {
                                    setGRDetailsState((prevStates) => ({
                                        ...prevStates,
                                        showAddCatalogue: false,
                                        selectedCatalogueItems: []
                                    }));
                                }}
                                columnDefs={CatalogueItemColDefs}
                                rowDataItem={grDetailsState.listCatalogueBySupplier}
                                onSelectionChanged={(params) => {
                                    setGRDetailsState((prevStates) => ({
                                        ...prevStates,
                                        selectedCatalogueItems: params.api.getSelectedNodes()
                                    }));
                                }}
                                selected={grDetailsState.rowDataItemsOrdered}
                                backendPagination
                                backendServerConfig={catalogueBEServerConfig}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};
export default CreateGRFromNonPO;
