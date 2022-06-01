import React, { useEffect, useRef, useState } from "react";
import {
    Button,
    Card, CardBody, CardHeader, Col, Container, Row
} from "components";
import { HeaderMain } from "routes/components";
import { useTranslation } from "react-i18next";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import { useHistory } from "react-router";
import { Checkbox } from "primereact/checkbox";
import { useCurrentCompany, useToast } from "routes/hooks";
import DocumentTemplateService from "services/DocumentTemplateService";
import { POPreviewModal } from "routes/P2P/PurchaseOrder/components";
import { useSelector } from "react-redux";
import POWithPriceDefaultThumb from "./thumbs/POWithPrice-Default.jpg";
import POWithPriceTemplate1Thumb from "./thumbs/POWithPrice-Template1.jpg";
import POWithoutPriceDefaultThumb from "./thumbs/POWithoutPrice-Default.jpg";
import POWithoutPriceTemplate1Thumb from "./thumbs/POWithoutPrice-Template1.jpg";

const ManageDocumentTemplate = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const currentCompany = useCurrentCompany();
    const toast = useToast();
    const [data, setData] = useState();
    const [totalAmount, setTotalAmount] = useState();
    const [type, setType] = useState();

    const previewModalRef = useRef(null);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer } = permissionReducer;

    const dataPOWithPrice = {
        approvalConfig: true,
        project: false,
        projectCode: "",
        poNumber: "",
        prNumber: "PR-000000239",
        poUuid: "72e279dd-fb92-4f47-ab2f-50b9805a7609",
        poStatus: "PENDING ISSUE",
        currencyCode: "SGD",
        supplier: {
            companyCode: "MADO",
            companyName: "MAYNARD DOYLE",
            contactPersonName: "Lucas Steele",
            countryOfOrigin: "Singapore",
            contactPersonEmail: "lucas.maynard@getnada.com",
            contactPersonWorkNumber: "0987654321",
            countryCode: "65",
            companyRegNo: "UEN111",
            uuid: "86a8db67-05a0-45c8-b2c2-74508bfc3bcf"
        },
        prePoNumber: "CONVERTED_FROM_PR",
        poTitle: "PR 0001",
        procurementType: "Goods",
        approvalRouteName: "",
        approvalRouteSequence: "",
        nextApprover: "",
        requestorUuid: "",
        requestorName: "Bartell Group",
        convertedDate: "18/03/2022 11:05:08",
        paymentTerms: "30 Days",
        addressUuid: "df52f0eb-56d7-40f1-b356-ef82f524db70",
        remarks: "",
        poDate: "",
        issuedDate: "",
        prUuid: "3549b066-3a5e-4af6-bcf1-a56d10ce818c",
        ppoUuid: "",
        currencyName: "Singapore Dollar",
        currency: "Singapore Dollar (+SGD)",
        enablePrefix: true,
        changeNatureApproval: false,
        natureOfRequisition: "Non-Project",
        typeOfRequisition: "Purchase",
        addressLabel: "Maynard Doyle HQ",
        addressFirstLine: "Via Miguel de Cervantes 100",
        addressSecondLine: "",
        city: "Avigliano",
        state: "Potenza",
        country: "Viet Nam",
        postalCode: "85021",
        isPR: true,
        isInsensitive: false,
        projectTitle: "",
        itemList: [
            {
                itemCode: "115",
                itemName: "Plug",
                itemDescription: "Material: UPVC\nSize: 15mm Diameter\nModel: SS141",
                itemModel: "",
                itemSize: "",
                itemBrand: "",
                priceType: "",
                supplierName: "MAYNARD DOYLE",
                itemUnitPrice: 10,
                taxCode: "GST7",
                taxRate: 7,
                exchangeRate: 1,
                note: "Note",
                companyUuid: "60419a9f-ff39-4fd9-a9f5-97fb2e17b6d6",
                qtyConverted: 0,
                qtyReceived: 0,
                pendingDeliveryQty: 0,
                qtyRejected: 0,
                contracted: false,
                contractedPrice: 0,
                invoiceQty: 0,
                taxAmount: 7,
                netPrice: 100,
                subTotal: 100,
                pendingInvoiceQty: 0,
                itemCategory: "SERVICES",
                itemId: 0,
                sourceCurrency: "SGD",
                address: {
                    addressLabel: "Bartell HQ",
                    addressFirstLine: "627A Aljunied Road, #10-09",
                    addressSecondLine: "BIZTECH CENTRE",
                    city: "Singapore",
                    state: "Singapore",
                    country: "Singapore",
                    postalCode: "389842"
                },
                accountNumber: "1111111",
                uom: "Packet",
                requestedDeliveryDate: "2022-03-31",
                uuid: "821519d5-647e-49d9-8972-e6a4f3316246",
                manualItem: false,
                itemQuantity: 10,
                existingItem: true,
                inSourceCurrencyBeforeTax: 100,
                inDocumentCurrencyBeforeTax: 100,
                taxAmountInDocumentCurrency: 7,
                inDocumentCurrencyAfterTax: 107
            }
        ]
    };

    const totalAmountWithPrice = {
        subTotal: 100,
        tax: 7,
        total: 107
    };

    const dataPOWithoutPrice = {
        approvalConfig: true,
        project: false,
        projectCode: "",
        poNumber: "",
        poUuid: "b08e4e2d-0d88-4fdc-a11d-0e6140dbe62d",
        poStatus: "PENDING ISSUE",
        currencyCode: "SGD",
        supplier: {
            companyCode: "MADO",
            companyName: "MAYNARD DOYLE",
            contactPersonName: "Lucas Steele",
            countryOfOrigin: "Singapore",
            contactPersonEmail: "lucas.maynard@getnada.com",
            contactPersonWorkNumber: "0987654321",
            countryCode: "65",
            companyRegNo: "UEN111",
            uuid: "86a8db67-05a0-45c8-b2c2-74508bfc3bcf"
        },
        prePoNumber: "CONVERTED_FROM_PR",
        poTitle: "PPR 0001",
        procurementType: "Goods",
        approvalRouteName: "",
        approvalRouteSequence: "",
        nextApprover: "",
        requestorUuid: "",
        requestorName: "Bartell Group",
        convertedDate: "18/03/2022 10:49:59",
        paymentTerms: "30 Days",
        addressUuid: "df52f0eb-56d7-40f1-b356-ef82f524db70",
        remarks: "",
        poDate: "",
        issuedDate: "",
        prUuid: "",
        ppoUuid: "",
        currencyName: "Singapore Dollar",
        currency: "Singapore Dollar (+SGD)",
        enablePrefix: true,
        changeNatureApproval: false,
        natureOfRequisition: "Non-Project",
        typeOfRequisition: "Purchase",
        addressLabel: "Maynard Doyle HQ",
        addressFirstLine: "Via Miguel de Cervantes 100",
        addressSecondLine: "",
        city: "Avigliano",
        state: "Potenza",
        country: "Viet Nam",
        postalCode: "85021",
        isPR: false,
        isInsensitive: false,
        projectTitle: "",
        itemList: [
            {
                itemCode: "115",
                itemName: "Plug",
                itemDescription: "Material: UPVC\nSize: 15mm Diameter\nModel: SS141",
                itemModel: "",
                itemSize: "",
                itemBrand: "",
                supplierName: "MAYNARD DOYLE",
                itemUnitPrice: 0.4,
                taxRate: 0,
                exchangeRate: 1,
                note: "Note",
                companyUuid: "60419a9f-ff39-4fd9-a9f5-97fb2e17b6d6",
                qtyConverted: 0,
                qtyReceived: 0,
                pendingDeliveryQty: 0,
                qtyRejected: 0,
                contracted: true,
                contractedPrice: 0.4,
                contractReferenceNumber: "Contract-Ref-01",
                invoiceQty: 0,
                taxAmount: 0,
                netPrice: 4,
                subTotal: 4,
                pendingInvoiceQty: 0,
                itemCategory: "SERVICES",
                itemId: 0,
                address: {
                    addressLabel: "Bartell HQ",
                    addressFirstLine: "627A Aljunied Road, #10-09",
                    addressSecondLine: "BIZTECH CENTRE",
                    city: "Singapore",
                    state: "Singapore",
                    country: "Singapore",
                    postalCode: "389842"
                },
                uom: "Pc",
                requestedDeliveryDate: "2022-03-31",
                uuid: "1fb1d09b-26bf-422e-85dc-33265b1b93aa",
                manualItem: false,
                itemQuantity: 10,
                existingItem: true,
                inSourceCurrencyBeforeTax: 4,
                inDocumentCurrencyBeforeTax: 4,
                taxAmountInDocumentCurrency: 0,
                inDocumentCurrencyAfterTax: 4
            }
        ],
        contractReferenceNumber: "Contract-Ref-01"
    };

    const totalAmountWithoutPrice = {
        subTotal: 4,
        tax: 0,
        total: 4
    };

    const DocumentTypes = [
        {
            name: t("PurchaseOrder"),
            children: [{
                code: "poWPrice",
                name: t("Purchase Order with Price"),
                options: [
                    {
                        code: "DEFAULT",
                        name: t("System Default"),
                        thumb: POWithPriceDefaultThumb,
                        data: dataPOWithPrice,
                        totalAmount: totalAmountWithPrice
                    },
                    {
                        code: "TEMPLATE_2",
                        name: t("Template 1"),
                        thumb: POWithPriceTemplate1Thumb,
                        data: dataPOWithPrice,
                        totalAmount: totalAmountWithPrice
                    }
                ]
            }, {
                code: "poWOPrice",
                name: t("Purchase Order without Price"),
                options: [
                    {
                        code: "DEFAULT",
                        name: t("System Default"),
                        thumb: POWithoutPriceDefaultThumb,
                        data: dataPOWithoutPrice,
                        totalAmount: totalAmountWithoutPrice
                    },
                    {
                        code: "TEMPLATE_2",
                        name: t("Template 1"),
                        thumb: POWithoutPriceTemplate1Thumb,
                        data: dataPOWithoutPrice,
                        totalAmount: totalAmountWithoutPrice
                    }
                ]
            }]
        }
    ];

    const [settings, setSettings] = useState({});

    const getDocumentTemplateSettings = async (companyUuid) => {
        try {
            const settingData = await DocumentTemplateService.getDocumentTemplateSettings(companyUuid);
            setSettings(settingData?.data);
        } catch (e) {
            console.error(e);
            toast("error", e?.response?.data?.message || e?.message);
        }
    };

    useEffect(() => {
        if (currentCompany?.companyUuid) {
            getDocumentTemplateSettings(currentCompany?.companyUuid);
        }
    }, [currentCompany]);

    const onSave = async () => {
        try {
            const body = {
                companyUuid: currentCompany?.companyUuid,
                ...settings
            };
            await DocumentTemplateService.updateDocumentTemplateSettings(currentCompany?.companyUuid, body);
            toast("success", "Document Template update successfully");
        } catch (e) {
            console.error(e);
            toast("error", e?.response?.data?.message || e?.message);
        }
    };

    const previewTemplate = (dataTemplate, totalAmountTemplate, typeTemplate) => {
        setData(dataTemplate);
        setTotalAmount(totalAmountTemplate);
        setType(typeTemplate);
        previewModalRef?.current?.toggle();
        console.log("preview Template");
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-2">
                    <Col md={6} lg={6}>
                        <HeaderMain
                            title={t("Document Template")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Card>
                    <CardHeader tag="h6">
                        {t("Document Template")}
                    </CardHeader>
                    <CardBody>
                        {DocumentTypes.map((group) => (
                            <div>
                                <h5 className="mb-3">{group?.name}</h5>
                                <Row>
                                    {group?.children?.map((feature) => (
                                        <Col xs={6}>
                                            <h6 className="mb-3">{feature?.name}</h6>
                                            <Row>
                                                {feature?.options?.map((option) => (
                                                    <Col xs={6}>
                                                        <img src={option?.thumb} alt="" className="w-100" style={{ height: "90%", cursor: "pointer" }} onClick={() => previewTemplate(option.data, option.totalAmount, option.code)} aria-hidden="true" />
                                                        <div className="p-field-checkbox justify-content-center mt-2">
                                                            <Checkbox
                                                                checked={settings?.[feature.code]
                                                                    ? settings[feature.code] === option?.code
                                                                    : option.code === "DEFAULT"}
                                                                onChange={() => setSettings({
                                                                    ...settings,
                                                                    [feature.code]: option?.code
                                                                })}
                                                            />
                                                            <label className="mb-0 ml-2" htmlFor="active">
                                                                {option?.name}
                                                            </label>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>

                                    ))}
                                </Row>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </Container>
            <StickyFooter>
                <Row className="justify-content-between mx-0 px-3">
                    <Button
                        color="secondary"
                        className="mb-2"
                        onClick={() => history.goBack()}
                    >
                        {t("Back")}
                    </Button>
                    <Button
                        color="primary"
                        type="button"
                        className="mb-2"
                        onClick={onSave}
                        disabled={!currentCompany?.companyUuid}
                    >
                        {t("Save")}
                    </Button>
                </Row>
            </StickyFooter>
            <POPreviewModal
                ref={previewModalRef}
                isBuyer={isBuyer}
                data={data}
                companyUuid={currentCompany?.companyUuid}
                poAmountTotal={totalAmount}
                typeTemplate={type}
            />
        </>

    );
};

export default ManageDocumentTemplate;
