import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

const ListAPSpecialistColDefs = [
    {
        headerName: i18next.t("GroupCode"),
        field: "groupCode"
    },
    {
        headerName: i18next.t("NoOfEntities"),
        field: "noOfEntities",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("CreatedBy"),
        field: "createdByName"
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedOn",
        valueFormatter: ({ value }) => convertToLocalTime(value)
    }
];

export default ListAPSpecialistColDefs;
