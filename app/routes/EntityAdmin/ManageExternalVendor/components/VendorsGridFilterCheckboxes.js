import React from "react";
import { Checkbox } from "primereact/checkbox";

const VendorsGridFilterCheckboxes = (props) => {
    const {
        t,
        onChange,
        seller,
        buyer
    } = props;
    return (
        <div className="d-flex flex-row">
            <div className="p-field-checkbox mr-4">
                <Checkbox inputId="suppliers" name="suppliers" value={t("Suppliers")} onChange={(e) => onChange("seller", e.checked)} checked={seller} />
                <label htmlFor="suppliers" className="mb-0">{t("Suppliers")}</label>
            </div>
            <div className="p-field-checkbox">
                <Checkbox inputId="buyers" name="buyers" value={t("Buyers")} onChange={(e) => onChange("buyer", e.checked)} checked={buyer} />
                <label htmlFor="buyers" className="mb-0">{t("Buyers")}</label>
            </div>
        </div>
    );
};

export default VendorsGridFilterCheckboxes;
