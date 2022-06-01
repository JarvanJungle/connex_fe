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
import {
    formatDateString, convertToLocalTime,
    itemAttachmentSchema,
    minusToPrecise,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import {
    Conversation, Blockchain, Overview, AddItemDialog
} from "routes/components";
import useToast from "routes/hooks/useToast";
import useAuditTrail from "routes/hooks/useAuditTrail";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import { HeaderMain } from "routes/components/HeaderMain";
import * as Yup from "yup";
import EntitiesService from "services/EntitiesService";
import { v4 as uuidv4 } from "uuid";
import { CatalogueItemColDefs } from "routes/P2P/PurchaseRequest/ColumnDefs";
import CatalogueService from "services/CatalogueService";
import ConversationService from "services/ConversationService/ConversationService";
import UOMDataService from "services/UOMService";
import {
    GoodsReceiptDetails,
    GeneralInfor,
    InitialSettings,
    SupplierInfor,
    ItemsOrderedDO,
    ItemsOrderedNonPO,
    ItemsOrderedPO
} from "../components";
import GR_CONSTANTS from "../constants/constants";
import GOODS_RECEIPT_ROUTES from "../route";
import {
    itemsOrderedNonPOSchema,
    itemsOrderedPOSchema
} from "../validation/validation";

const GRDetails = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const showToast = useToast();

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
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
        externalConversationLines: [],
        internalConversationLines: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataOverview: [],
        rowDataItemsOrdered: [],
        grDetails: {},
        approvalRoutes: [],
        grUuid: "",
        showAddCatalogue: false,
        selectedCatalogueItems: [],
        catalogueItems: [],
        listCatalogueBySupplier: [],
        uoms: [],
        modeView: {
            isEditMode: false,
            isViewDetailsMode: false,
            isApprovalMode: false,
            isGrCreator: false
        }
    });
    const [itemDeleted, setItemDeleted] = useState("");
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);
    const [rowDataAuditTrail, setRowDataAuditTrail] = useAuditTrail([]);
    const approvalConfig = useApprovalConfig(FEATURE.GR);

    const [disableButton, setDisableButton] = useState(false);

    const initialValues = {
        approvalConfig: false,
        isEdit: false,
        grCreator: false,
        grType: "",
        deliveryOrderNumber: "",
        grStatus: GR_CONSTANTS.DO,
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
        approvalRouteName: "",
        approvalRoute: "",
        approvalSequence: "",
        grNumber: "",
        nextApprover: "",
        receiptDate: ""
    };

    const validationSchema = Yup.object().shape({
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
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

    const checkModeView = (status, grCreator, approverRole, hasApproved) => {
        const modeView = {
            isEditMode: false,
            isViewDetailsMode: false,
            isApprovalMode: false,
            isGrCreator: grCreator
        };

        if (hasApproved) {
            modeView.isViewDetailsMode = true;
            return modeView;
        }

        if (grCreator && approverRole) {
            switch (status) {
            case GR_CONSTANTS.SAVED_AS_DRAFT:
            case GR_CONSTANTS.SAVE_AS_DRAFT:
                modeView.isEditMode = true;
                break;
            case GR_CONSTANTS.PENDING_APPROVAL:
                modeView.isApprovalMode = true;
                break;
            case GR_CONSTANTS.APPROVED:
            case GR_CONSTANTS.COMPLETED:
            default:
                modeView.isViewDetailsMode = true;
                break;
            }
        } else if (grCreator && !approverRole) {
            switch (status) {
            case GR_CONSTANTS.SAVED_AS_DRAFT:
            case GR_CONSTANTS.SAVE_AS_DRAFT:
                modeView.isEditMode = true;
                break;
            default:
                modeView.isViewDetailsMode = true;
                break;
            }
        } else if (!grCreator && approverRole) {
            switch (status) {
            case GR_CONSTANTS.PENDING_APPROVAL:
                modeView.isApprovalMode = true;
                break;
            default:
                modeView.isViewDetailsMode = true;
                break;
            }
        } else {
            modeView.isViewDetailsMode = true;
        }

        return modeView;
    };

    const initData = async (companyUuid, grUuid) => {
        if (grDetailsState.companyUuid) return;
        let approvalRoutes = [];
        let addresses = [];
        let suppliers = [];
        let grDetails = {};
        let catalogueItems = [];
        let uoms = [];
        const rowDataInternalConversation = [];
        const rowDataExternalConversation = [];
        let modeView = {
            isEditMode: false,
            isViewDetailsMode: false,
            isApprovalMode: false
        };

        const responses = await Promise.allSettled([
            ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                companyUuid, FEATURE.GR
            ),
            AddressDataService.getCompanyAddresses(companyUuid),
            GoodsReceiptService.grDetails(companyUuid, grUuid)
        ]);
        const [
            responseApprovalRoutes,
            responseAddresses,
            responseGRDetails
        ] = responses;
        approvalRoutes = getDataResponse(responseApprovalRoutes);
        addresses = getDataResponse(responseAddresses);
        grDetails = getDataResponse(responseGRDetails, "object");

        const {
            hasApproved, grStatus,
            grCreator, approverRole
        } = grDetails;

        if (grStatus === GR_CONSTANTS.SAVED_AS_DRAFT
            || grStatus === GR_CONSTANTS.SAVE_AS_DRAFT
        ) {
            const newResponses = await Promise.allSettled([
                ExtVendorService.getExternalVendors(companyUuid),
                CatalogueService.getCatalogues(companyUuid),
                UOMDataService.getUOMRecords(companyUuid, grUuid)
            ]);
            const [
                responseSuppliers,
                responseCatalogueItems,
                responseUOMs
            ] = newResponses;
            suppliers = getDataResponse(responseSuppliers);
            catalogueItems = getDataResponse(responseCatalogueItems).filter(
                (item) => item.manual === false && item.active === true
            );
            uoms = getDataResponse(responseUOMs);
        }

        modeView = {
            ...checkModeView(grStatus, grCreator, approverRole, hasApproved)
        };

        const supplierCompanyUuid = grDetails && grDetails.supplierCompanyUuid;

        const uuids = [
            ...grDetails.poUuids || [],
            ...grDetails.ppoUuids || [],
            ...grDetails.pprUuids || [],
            ...grDetails.prUuids || [],
            grDetails.uuid || []
        ];
        const listUuid = uuids?.filter((item) => item);
        const newArr = [];
        listUuid?.forEach((item) => {
            if (!newArr.includes(item)) {
                newArr.push(item);
            }
        });
        const newArrDO = [];
        grDetails?.doUuids?.forEach((item) => {
            if (!newArrDO.includes(item)) {
                newArrDO.push(item);
            }
        });
        await Promise.all(
            newArr.map(async (doUuid) => {
                const response = await ConversationService.getDetailInternalConversation(
                    companyUuid, doUuid
                );
                const { data } = response && response.data;
                if (data) {
                    response?.data?.data?.conversations?.forEach((item) => {
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
            newArr.map(async (doUuid) => {
                const response = await ConversationService.getDetailExternalConversation(
                    companyUuid, doUuid
                );
                const { data } = response && response.data;
                if (data) {
                    response?.data?.data?.conversations?.forEach((item) => {
                        rowDataExternalConversation.push({
                            userName: item.sender,
                            userRole: item.designation || "Supplier",
                            userUuid: item.userUuid,
                            dateTime: convertToLocalTime(new Date(item.createdAt),
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
                }
            }),
            newArrDO.map(async (doUuid) => {
                const response = await ConversationService.getDetailExternalConversation(
                    supplierCompanyUuid, doUuid
                );
                const { data } = response && response.data;
                if (data) {
                    response?.data?.data?.conversations?.forEach((item) => {
                        rowDataExternalConversation.push({
                            userName: item.sender,
                            userRole: item.designation || "Supplier",
                            userUuid: item.userUuid,
                            dateTime: convertToLocalTime(new Date(item.createdAt),
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
                }
            })
        );

        const overview = [];
        try {
            const resOverview = await GoodsReceiptService
                .grOverviewDetails(companyUuid, grUuid);
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
                        item.childNodes?.forEach(
                            (i) => getAllItemsPerChildren(i, newItem)
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

        setGRDetailsState((prevStates) => ({
            ...prevStates,
            approvalRoutes,
            addresses,
            suppliers,
            companyUuid,
            grUuid,
            grDetails,
            catalogueItems,
            uoms,
            rowDataInternalConversation,
            rowDataExternalConversation,
            modeView,
            rowDataOverview: overview,
            listCatalogueBySupplier: catalogueItems
        }));
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const grUuid = query.get("uuid");
        if (currentCompany && !_.isEmpty(userDetails)) {
            const { companyUuid } = currentCompany;
            initData(companyUuid, grUuid);
        }
    }, [currentCompany, userDetails]);

    const onApprovePressHandler = async (values) => {
        try {
            const {
                rowDataItemsOrdered,
                companyUuid,
                grDetails,
                grUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = grDetailsState;
            const { grType } = grDetails;

            const body = {
                grType: values.grType,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                items: [],
                itemNonPoDtos: [],
                uuid: grUuid,
                goodsReceiptDocumentMetadata: []
            };

            if (grType === GR_CONSTANTS.DO) {
                rowDataItemsOrdered?.forEach((element) => {
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
            }

            if (grType === GR_CONSTANTS.PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;

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

                rowDataItemsOrdered?.forEach((element) => {
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
            }

            if (grType === GR_CONSTANTS.NON_PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;
                delete body.supplierCompanyUuid;
                body.supplier = {
                    companyCode: values.supplierCode,
                    companyName: values.supplierName,
                    contactPersonName: values.contactName,
                    contactPersonEmail: values.contactEmail,
                    contactPersonWorkNumber: values.contactNumber,
                    countryCode: values.countryCode,
                    companyRegNo: values.companyRegNo,
                    countryOfOrigin: values.country,
                    uuid: values.supplierUuid
                };
                rowDataItemsOrdered?.forEach((item) => {
                    const {
                        supplierCode,
                        currencyCode,
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
                        uomCode: typeof uomCode === "string"
                            ? uomCode
                            : uomCode?.uomCode
                    };

                    if (!newItem.documentLabel) delete newItem.documentLabel;
                    if (!newItem.attachment) delete newItem.attachment;
                    if (!newItem.address.addressLabel) newItem.address = {};

                    body.itemNonPoDtos.push(newItem);
                });

                await itemsOrderedNonPOSchema.validate(body.itemNonPoDtos);
            }

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

            const response = await GoodsReceiptService.approveGR(
                companyUuid, body
            );

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

    const onSubmitPressHandler = async (values) => {
        setDisableButton(true);
        setTimeout(() => {
            setDisableButton(false);
        }, 1100);
        try {
            const {
                rowDataItemsOrdered,
                companyUuid,
                grDetails,
                grUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = grDetailsState;
            const { grType } = grDetails;

            const body = {
                grType: values.grType,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                items: [],
                itemNonPoDtos: [],
                uuid: grUuid,
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            if (grType === GR_CONSTANTS.DO) {
                rowDataItemsOrdered?.forEach((element) => {
                    if (element.qtyToConvert < element.qtyReceiving) {
                        throw Error("Quantity Receiving cannot be greater than Delivery Order Quantity");
                    }
                    const item = {
                        qtyReceiving: Number(element.qtyReceiving),
                        itemId: element.doItemId,
                        commentOnDelivery: element.commentsOnDelivery,
                        documentLabel: element.documentFileLabel,
                        attachment: element.documentGuid
                    };
                    if (!item.documentLabel) delete item.documentLabel;
                    if (!item.attachment) delete item.attachment;

                    body.items.push(item);
                });
            }

            if (grType === GR_CONSTANTS.PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;

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

                rowDataItemsOrdered?.forEach((element) => {
                    const item = {
                        qtyReceiving: Number(element.qtyReceiving),
                        itemId: element.poItemId,
                        commentOnDelivery: element.commentsOnDelivery,
                        documentLabel: element.documentFileLabel,
                        attachment: element.documentGuid
                    };
                    if (!item.documentLabel) delete item.documentLabel;
                    if (!item.attachment) delete item.attachment;

                    body.items.push(item);
                });
            }

            if (grType === GR_CONSTANTS.NON_PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;
                delete body.supplierCompanyUuid;
                body.supplier = {
                    companyCode: values.supplierCode,
                    companyName: values.supplierName,
                    contactPersonName: values.contactName,
                    contactPersonEmail: values.contactEmail,
                    contactPersonWorkNumber: values.contactNumber,
                    countryCode: values.countryCode,
                    companyRegNo: values.companyRegNo,
                    countryOfOrigin: values.country,
                    uuid: values.supplierUuid
                };
                rowDataItemsOrdered?.forEach((item) => {
                    const {
                        supplierCode,
                        currencyCode,
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
                        uomCode: typeof uomCode === "string"
                            ? uomCode
                            : uomCode?.uomCode
                    };

                    if (!newItem.documentLabel) delete newItem.documentLabel;
                    if (!newItem.attachment) delete newItem.attachment;
                    if (!newItem.address.addressLabel) newItem.address = {};

                    body.itemNonPoDtos.push(newItem);
                });

                await itemsOrderedNonPOSchema.validate(body.itemNonPoDtos);
            }

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
        setDisableButton(true);
        setTimeout(() => {
            setDisableButton(false);
        }, 1100);
        try {
            const {
                rowDataItemsOrdered,
                companyUuid,
                grDetails,
                grUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = grDetailsState;
            const { grType } = grDetails;

            const body = {
                grType: values.grType,
                approvalRouteUuid: values.approvalRoute,
                supplierCompanyUuid: values.supplierCompanyUuid,
                procurementType: values.procurementType,
                deliveryDate: convertToLocalTime(
                    values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                items: [],
                itemNonPoDtos: [],
                uuid: grUuid,
                goodsReceiptDocumentMetadata: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            if (grType === GR_CONSTANTS.DO) {
                rowDataItemsOrdered?.forEach((element) => {
                    if (element.qtyToConvert < element.qtyReceiving) {
                        throw Error("Quantity Receiving cannot be greater than Delivery Order Quantity");
                    }
                    const item = {
                        qtyReceiving: Number(element.qtyReceiving),
                        commentOnDelivery: element.commentsOnDelivery,
                        documentLabel: element.documentFileLabel,
                        attachment: element.documentGuid,
                        itemId: element.doItemId
                    };
                    if (!item.documentLabel) delete item.documentLabel;
                    if (!item.attachment) delete item.attachment;

                    body.items.push(item);
                });
            }

            if (grType === GR_CONSTANTS.PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;

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

                rowDataItemsOrdered?.forEach((element) => {
                    const item = {
                        qtyReceiving: Number(element.qtyReceiving),
                        itemId: element.poItemId,
                        commentOnDelivery: element.commentsOnDelivery,
                        documentLabel: element.documentFileLabel,
                        attachment: element.documentGuid
                    };
                    if (!item.documentLabel) delete item.documentLabel;
                    if (!item.attachment) delete item.attachment;

                    body.items.push(item);
                });
            }

            if (grType === GR_CONSTANTS.NON_PO) {
                body.deliveryOrderNumber = values.deliveryOrderNumber;
                delete body.supplierCompanyUuid;
                body.supplier = {
                    companyCode: values.supplierCode,
                    companyName: values.supplierName,
                    contactPersonName: values.contactName,
                    contactPersonEmail: values.contactEmail,
                    contactPersonWorkNumber: values.contactNumber,
                    countryCode: values.countryCode,
                    companyRegNo: values.companyRegNo,
                    countryOfOrigin: values.country,
                    uuid: values.supplierUuid
                };
                rowDataItemsOrdered?.forEach((item) => {
                    const {
                        supplierCode,
                        currencyCode,
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
                        uomCode: typeof uomCode === "string"
                            ? uomCode
                            : uomCode?.uomCode
                    };

                    if (!newItem.documentLabel) delete newItem.documentLabel;
                    if (!newItem.attachment) delete newItem.attachment;
                    if (!newItem.address.addressLabel) newItem.address = {};

                    body.itemNonPoDtos.push(newItem);
                });

                await itemsOrderedNonPOSchema.validate(body.itemNonPoDtos);
            }

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

    const renderActionButton = (values, dirty, errors, handleSubmit) => {
        const { grDetails } = grDetailsState;
        if (_.isEmpty(grDetails)) return (<></>);

        const { grStatus, approverRole, grCreator } = grDetails;
        if (grStatus === GR_CONSTANTS.PENDING_APPROVAL
            && approverRole
        ) {
            return (
                <Button
                    color="primary"
                    type="button"
                    onClick={
                        () => {
                            if (!dirty
                                || (dirty && Object.keys(errors).length)) {
                                showToast("error", "Validation error, please check your input.");
                                return;
                            }
                            handleSubmit();
                            onApprovePressHandler(values);
                        }
                    }
                >
                    {t("Approve")}
                </Button>
            );
        }

        if (grCreator
            && (grStatus === GR_CONSTANTS.SAVED_AS_DRAFT
                || grStatus === GR_CONSTANTS.SAVE_AS_DRAFT)
        ) {
            return (
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

                                onSubmitPressHandler(values);
                            }
                        }
                    >
                        {t("Submit")}
                    </Button>
                </Row>
            );
        }

        return (<></>);
    };

    const getGRStatus = (status) => {
        if (status === GR_CONSTANTS.SAVED_AS_DRAFT
            || status === GR_CONSTANTS.SAVE_AS_DRAFT
        ) {
            return GR_CONSTANTS.PENDING_SUBMISSION
                .replaceAll("_", " ");
        }
        return status.replaceAll("_", " ");
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
        handleFileUpload(event).then((result) => {
            if (!result) return;

            const newRowData = [...rowData];
            rowData?.forEach((row, index) => {
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

        newRowData?.forEach((item, index) => {
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

    const onEditItemsOrdered = (params) => {
        const { data } = params;
        const { rowDataItemsOrdered, grDetails } = grDetailsState;
        const { grType } = grDetails;
        const newRowData = [...rowDataItemsOrdered];
        if (grType === GR_CONSTANTS.DO) {
            rowDataItemsOrdered?.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].qtyRejecting = minusToPrecise(
                        data.qtyToConvert, Number(data.qtyReceiving)
                    );
                    newRowData[index].qtyReceiving = Number(data.qtyReceiving);
                    const poDeliveryCompleted = Number(data.qtyPendingDelivery) === 0;
                    newRowData[index].poDeliveryCompleted = poDeliveryCompleted;
                }
            });
        }

        if (grType === GR_CONSTANTS.PO) {
            rowDataItemsOrdered?.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].qtyReceiving = Number(data.qtyReceiving);
                    const poDeliveryCompleted = Number(data.qtyPendingDelivery) === 0;
                    newRowData[index].poDeliveryCompleted = poDeliveryCompleted;
                }
            });
        }

        if (grType === GR_CONSTANTS.NON_PO) {
            rowDataItemsOrdered?.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                }
            });
        }

        params.api.setRowData(newRowData);
        setGRDetailsState((prevStates) => ({
            ...prevStates,
            rowDataItemsOrdered: newRowData
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

    const addItemReqManual = () => {
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
        selectedCatalogueItems?.forEach((node) => {
            const { data } = node;
            newCatalogueItems?.forEach(
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

    useEffect(() => {
        if (itemDeleted) {
            const { listCatalogueBySupplier } = grDetailsState;
            const newCatalogueItems = [...listCatalogueBySupplier];
            newCatalogueItems?.forEach(
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
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = grDetailsState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData?.forEach((rowData, index) => {
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
        newRowData?.forEach((rowData, index) => {
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
        handleFileUpload(event).then((result) => {
            if (!result) return;
            if (isInternal) {
                const newRowData = [...rowData];
                newRowData?.forEach((row, index) => {
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
            newRowData?.forEach((row, index) => {
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

    const convertActionAuditTrail = (action) => {
        switch (action) {
        case GR_CONSTANTS.APPROVED:
            return "Approved Goods Receipt";
        case GR_CONSTANTS.SUBMIT:
            return "Submitted Goods Receipt";
        case GR_CONSTANTS.SAVE_AS_DRAFT.toLowerCase():
            return "Saved Goods Receipt As Draft";
        default:
            return action;
        }
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
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

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                onSubmit={() => { }}
                validationSchema={validationSchema}
            >
                {({
                    errors, values, touched,
                    handleChange, setFieldValue,
                    dirty, setTouched, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (!_.isEmpty(grDetailsState.grDetails)) {
                            const {
                                grDetails,
                                catalogueItems,
                                rowDataExternalAttachment,
                                modeView
                            } = grDetailsState;
                            const {
                                supplier,
                                goodsReceiptItem,
                                goodsReceiptAuditTrail,
                                grStatus,
                                supplierCompanyUuid,
                                externalDocuments,
                                internalDocuments
                            } = grDetails;
                            setFieldValue("isEdit", modeView.isApprovalMode || modeView.isEditMode);
                            setFieldValue("grType", grDetails.grType);
                            setFieldValue("deliveryOrderNumber", grDetails.deliveryOrderNumber || "");
                            setFieldValue("grStatus", getGRStatus(grStatus));
                            setFieldValue(
                                "deliveryDate",
                                grDetails.deliveryDate ? formatDateString(
                                    grDetails.deliveryDate,
                                    CUSTOM_CONSTANTS.YYYYMMDD
                                ) : ""
                            );
                            setFieldValue("supplierCode", supplier.companyCode);
                            setFieldValue("supplierName", supplier.companyName);
                            setFieldValue("contactName", supplier.contactPersonName);
                            setFieldValue("contactEmail", supplier.contactPersonEmail);
                            setFieldValue("contactNumber", supplier.contactPersonWorkNumber);
                            setFieldValue("country", supplier.countryOfOrigin || "");
                            setFieldValue("companyRegNo", supplier.companyRegNo);
                            setFieldValue("countryCode", supplier.countryCode);
                            setFieldValue("procurementType", grDetails.procurementType);
                            setFieldValue("approvalRoute", grDetails.approvalRouteUuid || "");
                            setFieldValue("approvalRouteName", grDetails.approvalRouteName || "");
                            setFieldValue("approvalSequence", grDetails.approvalRouteSequence || "");
                            setFieldValue("supplierUuid", supplier.uuid);
                            setFieldValue("supplierCompanyUuid", supplierCompanyUuid);
                            setFieldValue("grNumber", grDetails.grNumber);
                            setFieldValue("nextApprover", grDetails.nextApprover);
                            setFieldValue("receiptDate", grDetails.receiptDate
                                ? convertToLocalTime(
                                    grDetails.receiptDate,
                                    CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                )
                                : "");

                            let rowDataItemsOrdered = [];

                            if (grDetails.grType === GR_CONSTANTS.PO) {
                                rowDataItemsOrdered = goodsReceiptItem.map(
                                    ({
                                        qtyPendingDeliveryExcludeThisGR,
                                        purchaseOrderNumber,
                                        poQuantity,
                                        quantity,
                                        poNote,
                                        poNotes,
                                        qtyReceiving,
                                        qtyPendingDelivery,
                                        qtyReceived,
                                        previousReceived,
                                        ...rest
                                    }) => {
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.PENDING_SUBMISSION.replaceAll("_", " ")) {
                                            return ({
                                                ...rest,
                                                qtyReceiving,
                                                qtyReceived: previousReceived,
                                                previousReceived,
                                                quantity: poQuantity || quantity || 0,
                                                poNumber: purchaseOrderNumber,
                                                uuid: uuidv4(),
                                                poNote: poNote || poNotes,
                                                qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                                poDeliveryCompleted: qtyPendingDelivery === 0
                                            });
                                        }
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.PENDING_APPROVAL.replaceAll("_", " ")) {
                                            return ({
                                                ...rest,
                                                qtyReceiving,
                                                previousReceived,
                                                quantity: poQuantity || quantity || 0,
                                                poNumber: purchaseOrderNumber,
                                                uuid: uuidv4(),
                                                poNote: poNote || poNotes,
                                                qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                                poDeliveryCompleted: qtyPendingDelivery === 0
                                            });
                                        }
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.COMPLETED) {
                                            return ({
                                                ...rest,
                                                qtyReceived,
                                                qtyReceiving,
                                                previousReceived,
                                                quantity: poQuantity || quantity || 0,
                                                poNumber: purchaseOrderNumber,
                                                uuid: uuidv4(),
                                                poNote: poNote || poNotes,
                                                qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                                poDeliveryCompleted: qtyPendingDelivery === 0
                                            });
                                        }
                                        return ({
                                            ...rest,
                                            qtyReceiving,
                                            qtyReceived,
                                            quantity: poQuantity || quantity || 0,
                                            poNumber: purchaseOrderNumber,
                                            uuid: uuidv4(),
                                            poNote: poNote || poNotes,
                                            qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                            poDeliveryCompleted: qtyPendingDelivery === 0
                                        });
                                    }
                                );
                            }

                            if (grDetails.grType === GR_CONSTANTS.NON_PO) {
                                rowDataItemsOrdered = goodsReceiptItem.map(
                                    ({
                                        qtyReceiving,
                                        ...rest
                                    }) => ({
                                        ...rest,
                                        quantity: qtyReceiving,
                                        uuid: uuidv4()
                                    })
                                );
                            }

                            if (grDetails.grType === GR_CONSTANTS.DO) {
                                rowDataItemsOrdered = goodsReceiptItem.map(
                                    ({
                                        address,
                                        previousReceived,
                                        qtyPendingDelivery,
                                        qtyPendingDeliveryExcludeThisGR,
                                        deliveryOrderQuantity,
                                        deliveryOrderNumber,
                                        purchaseOrderNumber,
                                        qtyReceiving,
                                        poNote,
                                        poNotes,
                                        qtyRejected,
                                        ...rest
                                    }) => {
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.PENDING_SUBMISSION.replaceAll("_", " ")) {
                                            return ({
                                                ...rest,
                                                qtyRejected,
                                                qtyReceived: previousReceived,
                                                addressLabel: address?.addressLabel,
                                                qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                                qtyToConvert: deliveryOrderQuantity,
                                                qtyConverted: roundNumberWithUpAndDown(
                                                    Number(previousReceived)
                                                    + Number(qtyRejected)
                                                    + Number(deliveryOrderQuantity)
                                                ),
                                                doNumber: deliveryOrderNumber,
                                                poNumber: purchaseOrderNumber,
                                                qtyReceiving,
                                                qtyRejecting: minusToPrecise(
                                                    Number(deliveryOrderQuantity),
                                                    Number(qtyReceiving)
                                                ),
                                                poNote: poNote || poNotes,
                                                poDeliveryCompleted: qtyPendingDelivery === 0,
                                                uuid: uuidv4()
                                            });
                                        }
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.PENDING_APPROVAL.replaceAll("_", " ")) {
                                            return ({
                                                ...rest,
                                                qtyRejected,
                                                previousReceived,
                                                qtyReceived: previousReceived,
                                                addressLabel: address?.addressLabel,
                                                qtyPendingDelivery,
                                                qtyToConvert: deliveryOrderQuantity,
                                                qtyConverted: roundNumberWithUpAndDown(
                                                    Number(previousReceived)
                                                    + Number(qtyRejected)
                                                    + Number(deliveryOrderQuantity)
                                                ),
                                                doNumber: deliveryOrderNumber,
                                                poNumber: purchaseOrderNumber,
                                                qtyReceiving,
                                                qtyRejecting: minusToPrecise(
                                                    Number(deliveryOrderQuantity),
                                                    Number(qtyReceiving)
                                                ),
                                                poNote: poNote || poNotes,
                                                poDeliveryCompleted:
                                                    qtyPendingDelivery === 0,
                                                uuid: uuidv4()
                                            });
                                        }
                                        if (getGRStatus(grStatus) === GR_CONSTANTS.COMPLETED.replaceAll("_", " ")) {
                                            return ({
                                                ...rest,
                                                qtyRejected,
                                                previousReceived,
                                                addressLabel: address?.addressLabel,
                                                qtyPendingDelivery,
                                                qtyToConvert: deliveryOrderQuantity,
                                                doNumber: deliveryOrderNumber,
                                                poNumber: purchaseOrderNumber,
                                                qtyReceiving,
                                                qtyRejecting: minusToPrecise(
                                                    deliveryOrderQuantity, qtyReceiving
                                                ),
                                                poNote: poNote || poNotes,
                                                poDeliveryCompleted:
                                                    qtyPendingDelivery === 0,
                                                uuid: uuidv4()
                                            });
                                        }
                                        return ({
                                            ...rest,
                                            previousReceived,
                                            qtyRejected,
                                            addressLabel: address?.addressLabel,
                                            qtyPendingDelivery: qtyPendingDeliveryExcludeThisGR,
                                            qtyToConvert: deliveryOrderQuantity,
                                            doNumber: deliveryOrderNumber,
                                            poNumber: purchaseOrderNumber,
                                            qtyReceiving,
                                            qtyRejecting: minusToPrecise(
                                                deliveryOrderQuantity, qtyReceiving
                                            ),
                                            poNote: poNote || poNotes,
                                            uuid: uuidv4()
                                        });
                                    }
                                );
                            }

                            const newCatalogueItems = [...catalogueItems];
                            rowDataItemsOrdered?.forEach(
                                (item) => {
                                    const { itemCode } = item;
                                    newCatalogueItems?.forEach(
                                        (element, index) => {
                                            if (element.catalogueItemCode === itemCode) {
                                                newCatalogueItems[index].isSelected = true;
                                            }
                                        }
                                    );
                                }
                            );
                            let externalAttachmentDO = [];
                            let internalAttachmentDO = [];
                            if (grDetails.grType === GR_CONSTANTS.DO) {
                                externalAttachmentDO = externalDocuments?.map(
                                    ({ uploadedByName, uploadedOn, ...rest }) => ({
                                        ...rest,
                                        uploadedOn: convertToLocalTime(
                                            uploadedOn,
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                        ),
                                        uploadedBy: uploadedByName
                                    })
                                );
                                internalAttachmentDO = internalDocuments?.map(
                                    ({ uploadedByName, uploadedOn, ...rest }) => ({
                                        ...rest,
                                        uploadedOn: convertToLocalTime(
                                            uploadedOn,
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                        ),
                                        uploadedBy: uploadedByName
                                    })
                                );
                            }

                            let newExternalAttachment = [...rowDataExternalAttachment];
                            newExternalAttachment = rowDataExternalAttachment.concat(grDetails
                                .goodsReceiptDocumentMetadata.filter(
                                    (attachment) => attachment.externalDocument === true
                                ).map(
                                    ({ uploadedOn, ...rest }) => ({
                                        ...rest,
                                        uploadedOn: convertToLocalTime(
                                            uploadedOn,
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                        )
                                    })
                                ));
                            newExternalAttachment = externalAttachmentDO.concat(
                                newExternalAttachment
                            );

                            const internalAttachments = grDetails
                                .goodsReceiptDocumentMetadata.filter(
                                    (attachment) => attachment.externalDocument === false
                                ).map(
                                    ({ uploadedOn, ...rest }) => ({
                                        ...rest,
                                        uploadedOn: convertToLocalTime(
                                            uploadedOn,
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                        )
                                    })
                                );
                            const rowDataInternalAttachment = internalAttachmentDO
                                .concat(internalAttachments);

                            setGRDetailsState((prevStates) => ({
                                ...prevStates,
                                rowDataItemsOrdered,
                                catalogueItems: newCatalogueItems,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment: newExternalAttachment
                            }));
                            setRowDataAuditTrail(goodsReceiptAuditTrail, convertActionAuditTrail);
                        }
                    }, [grDetailsState.grDetails]);

                    useEffect(() => {
                        const {
                            modeView
                        } = grDetailsState;
                        if (values.grStatus
                            && (modeView.isEditMode || modeView.isApprovalMode)
                        ) {
                            setTouched({
                                ...touched,
                                deliveryDate: true,
                                approvalRoute: true,
                                supplierCode: true,
                                deliveryOrderNumber: !!values.deliveryOrderNumber
                            });
                        }
                    }, [values.grStatus]);

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

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={12} lg={12}>
                                            <HeaderMain
                                                title={t("GoodsReceiptDetails")}
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
                                                type={values.grType}
                                                approvalRoutes={grDetailsState.approvalRoutes}
                                                onChangeApprovalRoute={(e) => {
                                                    onChangeApprovalRoute(e, setFieldValue);
                                                }}
                                                modeView={grDetailsState.modeView}
                                                tooltipOpen={tooltipOpen}
                                                toggle={toggle}
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <GeneralInfor
                                                t={t}
                                                values={values}
                                                procurementTypes={
                                                    grDetailsState.procurementTypes
                                                }
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

                            {
                                values.grType === GR_CONSTANTS.NON_PO && values.isEdit
                                    ? (
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
                                                    <span className="mr-1">+</span>
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
                                                    <span className="mr-1">+</span>
                                                    <span>{t("AddCatalogue")}</span>
                                                </Button>
                                            </div>
                                        </Row>
                                    ) : (
                                        <HeaderSecondary
                                            title={t("ItemsOrdered")}
                                            className="mb-2"
                                        />
                                    )
                            }
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {values.grType === GR_CONSTANTS.DO && (
                                        <ItemsOrderedDO
                                            t={t}
                                            rowDataItem={grDetailsState.rowDataItemsOrdered}
                                            onDeleteItem={() => { }}
                                            onCellValueChanged={
                                                (params) => onEditItemsOrdered(
                                                    params, values.grStatus
                                                )
                                            }
                                            onAddAttachment={(e, uuid, rowData) => {
                                                onAddAttachment(e, uuid, rowData);
                                            }}
                                            defaultExpanded
                                            disabled={grDetailsState.modeView.isViewDetailsMode}
                                            onDeleteFile={(uuid, rowData, params) => {
                                                onDeleteFile(uuid, rowData, params);
                                            }}
                                            companyUuid={grDetailsState.companyUuid}
                                        />
                                    )}
                                    {values.grType === GR_CONSTANTS.PO && (
                                        <ItemsOrderedPO
                                            t={t}
                                            rowDataItem={grDetailsState.rowDataItemsOrdered}
                                            onDeleteItem={() => { }}
                                            onCellValueChanged={
                                                (params) => onEditItemsOrdered(
                                                    params, values.grStatus
                                                )
                                            }
                                            onAddAttachment={(e, uuid, rowData) => {
                                                onAddAttachment(e, uuid, rowData);
                                            }}
                                            onChangePODeliveryCompleted={
                                                (e, rowData, data, params) => {
                                                    onChangeCheckbox(e, rowData, data, params);
                                                }
                                            }
                                            onDeleteFile={(uuid, rowData, params) => {
                                                onDeleteFile(uuid, rowData, params);
                                            }}
                                            defaultExpanded
                                            modeView={grDetailsState.modeView}
                                        />
                                    )}
                                    {values.grType === GR_CONSTANTS.NON_PO && (
                                        <ItemsOrderedNonPO
                                            t={t}
                                            rowDataItem={grDetailsState.rowDataItemsOrdered}
                                            onCellValueChanged={
                                                (params) => onEditItemsOrdered(
                                                    params, values.grStatus
                                                )
                                            }
                                            onAddAttachment={(e, uuid, rowData) => {
                                                onAddAttachment(e, uuid, rowData);
                                            }}
                                            onDeleteItem={(uuid, rowData, params) => {
                                                onDeleteItem(uuid, rowData, params);
                                            }}
                                            defaultExpanded
                                            disabled={grDetailsState.modeView.isViewDetailsMode}
                                            addresses={grDetailsState.addresses}
                                            onDeleteFile={(uuid, rowData, params) => {
                                                onDeleteFile(uuid, rowData, params);
                                            }}
                                        />
                                    )}
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
                                        disabled={!values.isEdit}
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
                                        disabled={!values.isEdit}
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-5">
                                <Col xs={12}>
                                    <Overview
                                        rowData={grDetailsState.rowDataOverview}
                                        rowDataAuditTrail={rowDataAuditTrail}
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
                                    {renderActionButton(values, dirty, errors, handleSubmit)}
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
                            />
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};
export default GRDetails;
