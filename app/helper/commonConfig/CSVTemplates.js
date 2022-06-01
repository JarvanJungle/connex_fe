import { Tune } from "@material-ui/icons";

const CSVTemplates = {
    Address_List_Headers: [
        { label: "Address Label*", key: "addresslabel" },
        { label: "Address Line 1*", key: "addressline1" },
        { label: "Address Line 2", key: "addressline2" },
        { label: "City", key: "city" },
        { label: "State/Province*", key: "state" },
        { label: "Country*", key: "country" },
        { label: "Postal Code*", key: "postalcode" },
        { label: "Is Default*", key: "default" },
        { label: "Is Active*", key: "active" }
    ],
    Address_List_Data: [
        {
            addresslabel: "XX XX",
            addressline1: "#05-01/02 Kimly Building",
            addressline2: "3 New Industrial Rd Singapore, Singapore 536197",
            city: "Singapore",
            state: "Singapore",
            country: "Singapore",
            postalcode: "536197",
            default: "Yes",
            active: "Yes"
        }
    ],
    Address_List_TemplatesFilename: "mass-upload-address-template.csv",
    NeededFields_Error: "Please fill in all the needed fields in the csv file",
    Address_List_Duplicated_Defaults_Error: "There should be only 1 default address",
    Address_List_DownloadFileName: "address_list",

    Currency_List_DownloadFileName: "currency_list",
    Currency_List_Headers: [
        { label: "Currency Code", key: "currencyCode" },
        { label: "Exchange Rate", key: "exchangeRate" },
        { label: "Is Default", key: "defaultCurrency" },
        { label: "Is Active", key: "active" }
    ],
    Currency_List_TemplatesFilename: "mass-upload-currency-template.csv",
    Currency_List_Data: [
        {
            currencyCode: "SGD", exchangeRate: 1, defaultCurrency: "No", active: "Yes"
        }
    ],
    Currency_List_Duplicated_Defaults_Error: "There should be only 1 default currency",

    UOM_List_Data: [{
        uomCode: "uomCode", uomName: "uomName", description: "description", active: "Yes"
    }],
    UOM_List_Headers: [
        { label: "UOM Code", key: "uomCode" },
        { label: "UOM Name", key: "uomName" },
        { label: "Description", key: "description" },
        { label: "Is Active", key: "active" }
    ],
    UOM_List_TemplatesFilename: "mass-upload-uom-template.csv",
    UOM_List_DownloadFileName: "uom_list",

    GL_Account_List_Headers: [
        { label: "G/L Account", key: "accountNumber" },
        { label: "Description", key: "description" },
        { label: "Cost Code", key: "costCode" },
        { label: "Department Code", key: "departmentCode" },
        { label: "Is Active", key: "active" }
    ],
    GL_Account_List_Data: [
        {
            accountNumber: 123123, description: "description", costCode: "123; 456", departmentCode: "AA; BB", active: "No"
        }
    ],
    GL_Account_List_TemplatesFilename: "mass-upload-gl-account-template.csv",
    GL_Account_List_DownloadFileName: "gl_account_list",

    Category_List_Headers: [
        { label: "Category Name", key: "categoryName" },
        { label: "Category Description", key: "categoryDescription" },
        { label: "Is Active", key: "active" }
    ],
    Category_List_Data: [
        { categoryName: "EQUIPMENT", categoryDescription: "equipment", active: "Yes" }
    ],
    Category_List_TemplatesFilename: "mass-upload-category-template.csv",
    Category_List_DownloadFileName: "category-list",

    Bank_Account_List_Headers: [
        { label: "Bank Label", key: "bankLabel" },
        { label: "Country", key: "country" },
        { label: "Bank Name", key: "bankName" },
        { label: "Bank Account No.", key: "bankAccountNo" },
        { label: "Account Holder Name", key: "accountHolderName" },
        { label: "Currency", key: "currency" },
        { label: "Swift Code", key: "country" },
        { label: "Branch", key: "branch" },
        { label: "Branch Code", key: "branchCode" },
        { label: "Branch City", key: "branchCity" },
        { label: "Branch Address Line 1", key: "branchAddressLine1" },
        { label: "Branch Address Line 1", key: "branchAddressLine2" },
        { label: "Postal Code", key: "postalCode" },
        { label: "State/ Province", key: "stateProvince" }
    ],
    Bank_Account_List_Data: [
        {
            bankLabel: "DBS Bank",
            country: "Singapore",
            bankName: "Test bank",
            bankAccountNo: 123456,
            accountHolderName: "John Tan",
            currency: "SGD",
            swiftCode: "TEST",
            branch: "Singapore Branch",
            branchCode: "BranchCode",
            branchCity: "Singapore",
            branchAddressLine1: "Singapore address 1",
            branchAddressLine2: "Singapore address 2",
            postalCode: "PostalCode",
            stateProvince: "Singapore"
        }
    ],
    Bank_Account_List_TemplatesFilename: "mass-upload-bank-account-template.csv",
    Bank_Account_List_DownloadFileName: "bank-account-list",

    Supplier_Bank_Account_List_Headers: [
        { label: "Company Code", key: "companyCode" },
        { label: "Bank Label", key: "bankLabel" },
        { label: "Country", key: "country" },
        { label: "Name", key: "bankName" },
        { label: "Bank Account No.", key: "bankAccountNo" },
        { label: "Account Holder Name", key: "accountHolderName" },
        { label: "Currency", key: "currency" },
        { label: "Swift Code", key: "swiftCode" },
        { label: "Branch", key: "branch" },
        { label: "Branch Code", key: "branchCode" },
        { label: "Branch City", key: "branchCity" },
        { label: "Branch Address Line 1", key: "branchAddressLine1" },
        { label: "Branch Address Line 2", key: "branchAddressLine2" },
        { label: "Postal Code", key: "postalCode" },
        { label: "State/ Province", key: "stateProvince" },
        { label: "Is Default", key: "defaultAccountBeforeApproval" }
    ],
    Supplier_Bank_Account_List_Data: [
        {
            companyCode: "MADO",
            bankLabel: "DBS Bank",
            country: "Singapore",
            bankName: "Test bank",
            bankAccountNo: 123456,
            accountHolderName: "John Tan",
            currency: "SGD",
            swiftCode: "TEST",
            branch: "Singapore Branch",
            branchCode: "BranchCode",
            branchCity: "Singapore",
            branchAddressLine1: "Singapore address 1",
            branchAddressLine2: "Singapore address 2",
            postalCode: "PostalCode",
            stateProvince: "Singapore",
            defaultAccountBeforeApproval: "False"
        }
    ],
    Supplier_Bank_Account_List_TemplatesFilename: "mass-upload-supplier-bank-account-template.csv",
    Supplier_Bank_Account_List_DownloadFileName: "supplier-bank-account-list",

    Tax_Records_List_Headers: [
        { label: "Tax Code", key: "taxCode" },
        { label: "Tax Rate", key: "taxRate" },
        { label: "Description", key: "description" },
        { label: "Is Active", key: "active" },
        { label: "Is Default", key: "default" }
    ],
    Tax_Records_List_Data: [
        {
            taxCode: "SALE_TAX", taxRate: 0.00, description: "This is the sale tax that is applied on food and services", active: "No", default: "No"
        }
    ],
    Tax_Records_List_TemplatesFilename: "mass-upload-tax-records-template.csv",
    Tax_Records_List_DownloadFileName: "tax_records_list",

    Catalogue_List_DownloadFileName: "catalogue_list",
    Catalogue_List_Headers: [
        { label: "Contracted Item", key: "contracted" },
        { label: "Contract Reference No.", key: "contractedRefNo" },
        { label: "Item Code", key: "catalogueItemCode" },
        { label: "Item Name", key: "catalogueItemName" },
        { label: "Item Description", key: "description" },
        { label: "UOM Code", key: "uomCode" },
        { label: "Supplier Code", key: "supplierCode" },
        { label: "Supplier Name", key: "supplierName" },
        { label: "Item Category", key: "itemCategory" },
        { label: "Item Model", key: "itemModel" },
        { label: "Item Size", key: "itemSize" },
        { label: "Item Brand", key: "itemBrand" },
        { label: "G/L Code", key: "glAccountNumber" },
        { label: "Trade Code", key: "tradeCode" },
        { label: "Currency Code", key: "currencyCode" },
        { label: "Unit Price", key: "unitPrice" },
        { label: "Contracted Price", key: "contractedPrice" },
        { label: "Valid From", key: "validFrom" },
        { label: "Valid To", key: "validTo" },
        { label: "Tax Code", key: "taxCode" },
        { label: "Tax Percentage", key: "taxRate" },
        { label: "Contracted Quantity", key: "contractedQty" },
        { label: "Project", key: "projectCodes" },
        { label: "Is Active", key: "isActive" }
    ],
    Catalogue_List_TemplatesFilename: "mass-upload-catalogue-template.csv",
    Catalogue_List_Data: [
        {
            contracted: "Yes",
            contractedRefNo: "CTRCT87654",
            catalogueItemCode: "STATIONERY002",
            catalogueItemName: "10 Hole Copysafe",
            description: "Color: Clear Package: 100 Pcs/Box",
            uomCode: "Box",
            supplierCode: "MADO",
            supplierName: "MAYNARD DOYLE",
            itemCategory: "MACHINERY",
            itemModel: "itemModel",
            itemSize: "A4",
            itemBrand: "Sure mark",
            glAccountNumber: "120002",
            tradeCode: "B1.0",
            currencyCode: "SGD",
            unitPrice: 5.01,
            contractedPrice: 10.08,
            validFrom: "01/06/2021",
            validTo: "10/10/2021",
            taxCode: "GST7",
            taxRate: 7.0,
            contractedQty: 10,
            projectCodes: "CODE1,PRJ0001",
            isActive: "Yes"
        },
        {
            contracted: "No",
            contractedRefNo: "",
            catalogueItemCode: "STATIONERY002",
            catalogueItemName: "10 Hole Copysafe",
            description: "Color: Clear Package: 100 Pcs/Box",
            uomCode: "Box",
            supplierCode: "MADO",
            supplierName: "MAYNARD DOYLE",
            itemCategory: "MACHINERY",
            itemModel: "itemModel",
            itemSize: "A4",
            itemBrand: "Sure mark",
            glAccountNumber: "120002",
            tradeCode: "B1.0",
            currencyCode: "SGD",
            unitPrice: 5.01,
            contractedPrice: 0,
            validFrom: "01/06/2021",
            validTo: "10/10/2021",
            taxCode: "GST7",
            taxRate: 7.0,
            contractedQty: 10,
            projectCodes: "",
            isActive: "Yes"
        }
    ],
    ManageProjectTrade_List_DownloadFileName: "project_trades_list",
    ManageProjectTrade_List_Headers: [
        { label: "Trade Code", key: "tradeCode" },
        { label: "Trade Title", key: "tradeTitle" },
        { label: "Description", key: "description" },
        { label: "Is Active", key: "isActive" }
    ],
    ManageProjectTrade_List_TemplatesFilename: "mass-upload-project-trades-template.csv",
    ManageProjectTrade_List_Data: [{
        tradeCode: "A1",
        tradeTitle: "New Trade A1",
        description: "New Trade A1",
        isActive: "Yes"
    }],
    ManageProjectTrade_List_Duplicated_Defaults_Error: "There should be only 1 default project trade",

    ManageProjectForecast_TemplatesFilename: "mass-upload-project-forecast-template.csv",
    ManageProjectForecast_Headers: [
        { label: "Item Code", key: "code" },
        { label: "Item Name", key: "name" },
        { label: "Description", key: "description" },
        { label: "Model", key: "model" },
        { label: "Size", key: "size" },
        { label: "Brand", key: "brand" },
        { label: "UOM", key: "uom" },
        { label: "Currency", key: "currency" },
        { label: "Unit Price", key: "unitPrice" },
        { label: "Quantity", key: "quantity" },
        { label: "Exchange", key: "exchange" },
        { label: "Trade Code", key: "tradeCode" },
        { label: "Category", key: "category" }
    ],
    ManageProjectForecast_List_Data: [{
        code: "STATIONERY001",
        name: "11 Hole Copysafe",
        description: "Color: Clear Package: 100 Pcs/Box",
        model: "Model",
        size: "Size",
        brand: "Brand",
        uom: "Box",
        currency: "SGD",
        unitPrice: 1,
        quantity: 10,
        exchange: 1,
        tradeCode: "B.1",
        category: "MACHINERY"
    }],
    ManageProjectForecast_Filename: "project-forecast.csv",

    ManageExtVendor_List_DownloadFileName: "external_vendors_list",

    ManageExtVendor_TemplateFileName: "mass-upload-external-vendors.csv",
    ManageExtVendor_List_Header: [
        { label: "Is Buyer", key: "isBuyer" },
        { label: "Is Supplier", key: "isSupplier" },
        { label: "Company Code", key: "companyCode" },
        { label: "Company Name", key: "companyName" },
        { label: "Company Reg. No", key: "companyRegNo" },
        { label: "Country of Origin", key: "countryOfOrigin" },
        { label: "Payment Term", key: "paymentTerm" },
        { label: "Tax Registered Business", key: "taxRegisteredBusiness" },
        { label: "Tax Reg. No.", key: "taxRegNo" },
        { label: "Tax Code", key: "taxCode" },
        { label: "Contact Name 1", key: "contactName1" },
        { label: "Email Address 1", key: "emailAddress1" },
        { label: "Country Code 1", key: "countryCode1" },
        { label: "Work Number 1", key: "workNumber1" },
        { label: "Contact Name 2", key: "contactName2" },
        { label: "Email Address 2", key: "emailAddress2" },
        { label: "Country Code 2", key: "countryCode2" },
        { label: "Work Number 2", key: "workNumber2" },
        { label: "Address Label 1", key: "addressLabel1" },
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Postal Code", key: "postalCode" },
        { label: "Country", key: "country" },
        { label: "City", key: "city" },
        { label: "State/Province", key: "state" },
        { label: "Address Label 2", key: "addressLabel2" },
        { label: "Address Line 1", key: "addressLine3" },
        { label: "Address Line 2", key: "addressLine4" },
        { label: "Postal Code", key: "postalCode1" },
        { label: "Country", key: "country1" },
        { label: "City", key: "city1" },
        { label: "State/Province", key: "state1" }
    ],
    ManageExtVendor_List_Data: [
        {
            isBuyer: "No",
            isSupplier: "Yes",
            companyCode: "MORTON",
            companyName: "KELSEY MORTON",
            companyRegNo: "UEN",
            countryOfOrigin: "Singapore",
            paymentTerm: 7,
            taxRegisteredBusiness: "Yes",
            taxRegNo: "MR85003113",
            taxCode: "GST 7",
            contactName1: "Lucas Steele",
            emailAddress1: "lucas.maynard@getnada.com",
            countryCode1: "65",
            workNumber1: "987654321",
            contactName2: "",
            emailAddress2: "",
            countryCode2: "",
            workNumber2: ""
        }
    ],
    WorkSpace_File_Name: "work_space_list",

    PaymentCycle_List_DownloadFileName: "payment_cycle_list",
    PaymentCycle_List_TemplateFileName: "mass-upload-payment-cycles-template.csv",
    PaymentCycle_List_Data: [
        {
            paymentCycleCode: "paymentCycleCode1",
            paymentCycleDate: 30,
            description: "description1",
            companyCode: "companyCode1, companyCode2",
            active: "Yes"
        }
    ],

    ApprovalGroup_List_DownloadFileName: "approval_groups_list",
    ApprovalGroup_List_Headers: [
        { label: "Approval Group Name*", key: "groupName" },
        { label: "Approvers*", key: "groupUserList" },
        { label: "Remarks", key: "groupDescription" },
        { label: "Is Active", key: "active" }
    ],
    ApprovalGroup_List_TemplatesFilename: "mass-upload-approval-group-template.csv",
    ApprovalGroup_List_Data: [{
        groupName: "Purchaser",
        groupUserList: "approver1@doxa-holdings.com, approver1@doxa-holdings.com",
        groupDescription: "Approval Group Note",
        active: "Yes"
    }],
    PaymentCycle_List_Headers: [
        { label: "Payment Cycle Code*", key: "paymentCycleCode" },
        { label: "Payment Cycle Date*", key: "paymentCycleDate" },
        { label: "Description", key: "description" },
        { label: "Company Code", key: "companyCode" },
        { label: "Is Active*", key: "active" }
    ],

    List_AP_Specialist_DownloadFileName: "list-ap-specialist",
    AP_Specialist_TemplateFileName: "mass-ap-specialist-template.csv",
    AP_Specialist_ListHeaders: [
        { label: "Group Code *", key: "groupCode" },
        { label: "AP Specialist Group *", key: "apListGroup" },
        { label: "Remarks", key: "remarks" },
        { label: "External Vendors *", key: "externalVendor" }
    ],
    AP_Specialist_ListData: [
        {
            groupCode: "AP",
            apListGroup: "user1@gmail.com, user2@gmail.com",
            remarks: "",
            externalVendor: "VENDOR_CODE1, VENDOR_CODE2"
        }
    ],

    WorkRequest_WorkSpace_FileName: "work_request_work_space_list",
    WorkRequest_WorkSpace_TemplateFileName: "mass-work-request-work-space-template.csv",
    WorkRequest_WorkSpace_ListHeaders: [
        { label: "Group Number", key: "groupNumber" },
        { label: "Parent Group", key: "parentGroup" },
        { label: "Work Code", key: "workCode" },
        { label: "Description", key: "description" },
        { label: "Uom Code", key: "uom" },
        { label: "Retention", key: "retention" },
        { label: "Retention %", key: "retentionPercentage" },
        { label: "Quantity", key: "quantity" },
        { label: "Unit Price", key: "unitPrice" },
        { label: "Remarks", key: "remarks" }
    ],
    WorkRequest_WorkSpace_ListData: [
        {
            groupNumber: "1",
            parentGroup: "",
            workCode: "ITC19",
            description: "REBAR2dd323232",
            uom: null,
            retention: true,
            retentionPercentage: null,
            quantity: null,
            unitPrice: null,
            remarks: "remarks example"
        },
        {
            groupNumber: "1.1",
            parentGroup: "1",
            workCode: "ITC19",
            description: "REBAR2dd323232",
            uom: null,
            retention: false,
            retentionPercentage: null,
            quantity: null,
            unitPrice: null,
            remarks: "remarks example"
        },
        {
            groupNumber: "1.1.1",
            parentGroup: "1.1",
            workCode: "ITC19",
            description: "REBAR2dd323232",
            uom: "Kg",
            retention: false,
            retentionPercentage: null,
            quantity: 1,
            unitPrice: 2,
            remarks: "remarks example"
        },
        {
            groupNumber: "1.1.2",
            parentGroup: "1.1",
            workCode: "ITC19",
            description: "REBAR2dd323232",
            uom: "Kg",
            retention: true,
            retentionPercentage: null,
            quantity: 1,
            unitPrice: 2,
            remarks: "remarks example"
        },
        {
            groupNumber: "2",
            parentGroup: null,
            workCode: "ITC19",
            description: "REBAR2dd323232",
            uom: "Kg",
            retention: true,
            retentionPercentage: null,
            quantity: 1,
            unitPrice: 2,
            remarks: "remarks example"
        }
    ]
};

export default CSVTemplates;
