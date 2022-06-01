import i18next from "i18next";
import { convertDate2String, timeComparator } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const editableLogicForManualOnly = (params) => (params.data.isNew && !params.data.isView);

const getAttachmentColDefs = () => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        cellStyle: (params) => ({
            display: params.data.isNew ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center"
        }),
        filter: false,
        maxWidth: 100
    },
    {
        headerName: i18next.t("FileLabel"),
        field: "fileLabel",
        editable: editableLogicForManualOnly,
        cellStyle: (params) => ({
            backgroundColor: params.data.isNew ? "#DDEBF7" : "transparent"
        })
    },
    {
        headerName: i18next.t("Attachment"),
        field: "attachment",
        cellRenderer: "addAttachment",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
        hide: editableLogicForManualOnly
    },
    {
        headerName: i18next.t("Description"),
        field: "fileDescription",
        editable: editableLogicForManualOnly,
        cellStyle: (params) => ({
            backgroundColor: params.data.isNew ? "#DDEBF7" : "transparent"
        })
    },
    {
        headerName: i18next.t("UploadedOn"),
        field: "uploadedOn",
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                if (typeof value === "string") return value;
                if (value instanceof Date) {
                    return convertDate2String(
                        value,
                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                    );
                }
            }
            return "";
        },
        comparator: timeComparator,
        sort: "desc"
    },
    {
        headerName: i18next.t("UploadedBy"),
        field: "uploadedBy"
    }
];

export default getAttachmentColDefs;
