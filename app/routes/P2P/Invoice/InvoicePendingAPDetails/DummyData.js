export default {
    status: "OK",
    data: {
        supplierDto: {
            supplierCode: "MADO",
            supplierUuid: "86a8db67-05a0-45c8-b2c2-74508bfc3bcf",
            supplierCompanyUuid: "714c1b91-847c-423a-a46c-a48532dd72d6",
            companyName: "MAYNARD DOYLE",
            address: {
                addressLabel: "Maynard Doyle HQ",
                addressFirstLine: "Via Miguel de Cervantes 100",
                addressSecondLine: "",
                city: "Avigliano",
                state: "Potenza",
                country: "Italy",
                postalCode: "85021"
            }
        },
        approvalRouteName: "STANDARD PURCHASE",
        approvalRouteSequence: "Purchasing Group (2) > AP Specialist Group (1)",
        approvalRouteUuid: "75916dd9-736f-47cc-a385-2f433e1380a9",
        invoiceNo: "INV-00000001",
        invoiceStatus: "PENDING_THREE_WAY",
        currencyCode: "SGD",
        paymentTerms: "30 (PAY IN 30 DAYS)",
        invoiceDate: "2021-09-01T12:00:00Z",
        invoiceDueDate: "2021-09-20T12:00:00Z",
        expectedAmount: 10001,
        expectedAmountGiven: true,
        matchItemDtoList: [
            {
                poNumber: "PO00000014",
                itemCode: "PPE001",
                itemName: "Safety Lifeline C/W MOM Certificate",
                size: "10 Metres",
                uom: "Pair",
                notes: "123",
                poQty: 10,
                poUnitPrice: 605,
                poTaxCode: "GST7",
                poTaxCodeValue: "7",
                invoiceQty: 2,
                invoiceUnitPrice: 10,
                invoiceTaxCode: "SALE_TAX",
                invoiceTaxCodeUuid: "TX001",
                invoiceTaxCodeValue: "7",
                grQtyReceived: 4,
                grQtyRejected: 0,
                invoiceCumulativeQty: 2,
                invoiceNetPrice: 20
            }
        ],

        invoiceAuditTrailDtoList: [
            {
                userName: "Naomi Harrison",
                role: "Purchaser",
                action: "INVOICE_APPROVED",
                date: "2021-09-15T10:31:14.167640Z"
            }
        ],
        invoiceDocumentMetadataDtoList: [
            {
                guid: "11111",
                fileLabel: "testing label",
                fileDescription: "testing description",
                uploadedOn: "2021-09-13 08:29:10",
                uploadedBy: "Bartell 123456",
                uploaderUuid: "o101001-f32d-44b8-9918-98566824a1f3",
                externalDocument: false
            }
        ]
    },
    timestamp: 1632467654202,
    statusCode: 0
};
