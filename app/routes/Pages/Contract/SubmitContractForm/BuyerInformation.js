import React from "react";
import {
    Row, Col, Card, CardBody
} from "components";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import SelectInput from "components/SelectInput";

function BuyerInformation() {
    return (
        <Card className="mt-3 mb-3" style={{ width: "49%", display: "flex" }}>
            <div className="m-4 font-weight-bold">Buyer Information</div>
            <CardBody>
                <Row>
                    <Col>
                        {/* <div className="divcontainer" style = {{lineHeight:3}}>
                        <div>Company Name</div>
                        <div>Contract Name</div>
                        <div>Contact Email</div>
                        <div>Contact Number</div>
                        <div>Tax Reg No.</div>
                        <div>Country</div>
                        <div>Address</div>
                        <div>Address Details</div>
                    </div> */}
                        <SelectInput
                            name="Company Name"
                            label={t("Company Name")}
                            className="label-required"
                            placeholder={t("PleaseSelectCompanyName")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={companyName}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                        />

                        <SelectInput
                            name="contractName"
                            label={t("Contract Name")}
                            className="label-required"
                            placeholder={t("PleaseSelectContractName")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={contractName}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                        // value={values.approvalRouteUuid}
                        // disabled={disabled}
                        />
                        <SelectInput
                            name="contractEmail"
                            label={t("Contract Email")}
                            className="label-required"
                            placeholder={t("PleaseSelectContractEmail")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={contractingEmail}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                        <SelectInput
                            name="contractNumber"
                            label={t("Contract Number")}
                            className="label-required"
                            placeholder={t("PleaseSelectContractNumber")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={contractNumber}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                        <SelectInput
                            name="taxRegNo"
                            label={t("Tax Reg No")}
                            className="label-required"
                            placeholder={t("PleaseSelectTaxRegNo")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={taxRegNo}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                        <SelectInput
                            name="country"
                            label={t("Country")}
                            className="label-required"
                            placeholder={t("PleaseSelectCountry")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={country}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                        <SelectInput
                            name="address"
                            label={t("address")}
                            className="label-required"
                            placeholder={t("PleaseSelectaddress")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={address}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                        <SelectInput
                            name="addressDetails"
                            label={t("Address Details")}
                            className="label-required"
                            placeholder={t("PleaseSelectAddressDetails")}
                            // errors={errors.approvalRouteUuid}
                            // touched={touched.approvalRouteUuid}
                            options={addressDetails}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => changeFormInfo(e)}
                            // value={values.approvalRouteUuid}
                            // disabled={disabled}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}

export default BuyerInformation;
