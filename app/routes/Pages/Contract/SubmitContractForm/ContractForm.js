import React from "react";
import BudgetDetails from "../ContractRequestForm/BudgetDetails";
import GeneralInformation from "../ContractRequestForm/GeneralInformation";
import BuyerInformation from "./BuyerInformation";
import SupplierInfo from "./SupplierInfo";
import ContractItems from "../ContractRequestForm/ContractItems";
import ESignDocuments from "./eSignDocuments";
import TermsAndConditions from "./TermsAndConditions";

function ContractForm() {
    return (
        <div>
            <GeneralInformation />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <BuyerInformation />
                <SupplierInfo />
            </div>
            <TermsAndConditions />
            <BudgetDetails />
            <ContractItems />
            <ESignDocuments />
        </div>
    );
}

export default ContractForm;
