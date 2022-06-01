import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const getTotalTableColDefs = (disabled) => [
    {
        headerName: i18next.t("VendorCode"),
        field: "vendorCode",
        cellRenderer: "agGroupCellRenderer",
        maxWidth: 150
    },
    {
        headerName: i18next.t("VendorName"),
        field: "vendorName",
        maxWidth: 300
    },
    {
        headerName: i18next.t("Currency"),
        field: "currency",
        maxWidth: 140
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        maxWidth: 200
    },
    {
        headerName: i18next.t("BankAccount"),
        field: "bankAccount",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: (params) => ({
            values: params.data.bankAccounts
        }),
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                return `${value.bankLabel} (${value.bankAccountNo})`;
            }
            return "";
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    }
];

export default getTotalTableColDefs;
