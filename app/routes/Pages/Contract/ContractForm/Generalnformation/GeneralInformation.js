import React from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    CardHeader
} from "components";
import { Checkbox } from "primereact/checkbox";
import HorizontalInput from "components/HorizontalInput";
import SelectInputComponent from "components/SelectInput";
import { CONTRACT_REQUEST_LIST_STATUS } from "helper/constantsDefined";
import { formatCurrenciesForDropbox } from "helper/utilities";
import BuyerInfo from "routes/Pages/Contract/ContractForm/BuyerInfo/BuyerInfo";
import SupplierInfo from "routes/Pages/Contract/ContractForm/SupplierInfo/SupplierInfo";
import { Label } from "reactstrap";
import classes from "./GeneralInformation.scss";

const SelectInput = ({ disabled, disabledValue, ...props }) => (disabled && disabledValue
    ? (
        <HorizontalInput
            name={props.name}
            label={props.label}
            type="text"
            className={props.className}
            value={disabledValue}
            disabled
        />
    )
    : <SelectInputComponent {...props} disabled={disabled} />);

const GeneralInformation = (props) => {
    const {
        t, errors,
        values,
        touched,
        setFieldValue,
        handleChange,
        onChangeEsign,
        contractingType,
        currencies,
        renewalOptions,
        natureOfContract,
        projects,
        onChangeProject,
        addresses,
        approvalRoutes,
        onChangeApprovalRoute,
        suppliers,
        companyUuid,
        permissionReducer,
        procurementTypes,
        contractData,
        isManualDP
    } = props;

    return (
        <Row>
            <Col xs={6}>
                {/* Raise Contract Request */}
                <Card className="mb-3">
                    <CardHeader tag="h6">{t("Raise Contract Request")}</CardHeader>
                    <CardBody>
                        <SelectInput
                            name="contractType"
                            label={t("Contract Type")}
                            className="label-required"
                            placeholder={t("Please Select Contract Type")}
                            errors={errors.contractType}
                            touched={touched.contractType}
                            options={contractingType}
                            optionLabel="label"
                            optionValue="value"
                            value={values.contractType}
                            onChange={handleChange}
                            disabled={!values.isEdit}
                        />
                        <SelectInput
                            name="natureOfContract"
                            label={t("Nature Of Contract")}
                            className="label-required"
                            placeholder={t("PleaseSelectNatureOfContract")}
                            touched={touched.natureOfContract}
                            options={natureOfContract}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.natureOfContract}
                            disabled={!values.isEdit || values.status === CONTRACT_REQUEST_LIST_STATUS.RECALLED}
                        />
                        {(values.natureOfContract === true || values.natureOfContract === "true") && (
                            <SelectInput
                                name="project"
                                label={t("SelectProject")}
                                className="label-required"
                                placeholder={t("PleaseSelectProject")}
                                // errors={errors.project}
                                touched={touched.project}
                                options={projects}
                                optionLabel="projectCode"
                                optionValue="projectCode"
                                onChange={
                                    (e) => onChangeProject(e, setFieldValue)
                                }
                                value={values.project}
                                disabled={!values.isEdit}
                                disabledValue={contractData?.projectCode}
                            />
                        )}
                    </CardBody>
                </Card>
                {/* Initial Settings Section */}
                <Card className="mb-3">
                    <CardHeader tag="h6">{t("InitialSettings")}</CardHeader>
                    <CardBody>
                        <HorizontalInput
                            name="contractNumber"
                            label={t("Contract No.")}
                            type="text"
                            className="label-required"
                            errors={errors.contractNumber}
                            touched={touched.currency}
                            value={values.contractNumber}
                            disabled={!(isManualDP && values.isEdit)}
                        />
                        <HorizontalInput
                            name="status"
                            label={t("Status")}
                            type="text"
                            placeholder={t("Status")}
                            className="optional input-uppercase"
                            onChange={handleChange}
                            value={values.status}
                            disabled
                        />
                        <SelectInput
                            name="currency"
                            label={t("Currency")}
                            className="label-required"
                            placeholder={t("PleaseSelectACurrency")}
                            errors={errors.currency}
                            touched={touched.currency}
                            options={formatCurrenciesForDropbox(currencies)}
                            optionLabel="currencyLabel"
                            optionValue="currencyCode"
                            onChange={handleChange}
                            value={values.currency}
                            disabled={
                                !values.isEdit
                                || values.natureOfContract === true
                                || values.natureOfContract === "true"
                            }
                            disabledValue={contractData?.currencyCode}
                        />
                        <HorizontalInput
                            name="contractValue"
                            label={t("Contract Value")}
                            type="text"
                            placeholder={t("Contract Value")}
                            errors={errors.contractValue}
                            touched={touched.contractValue}
                            value={`${values.currency} ${contractData?.subTotal?.toLocaleString() || 0}`}
                            onChange={handleChange}
                            disabled
                        />
                    </CardBody>
                </Card>
                {/* Supplier Information Section */}
                {!permissionReducer?.isBuyer && (
                    <BuyerInfo
                        t={t}
                        disabled={!values.isEdit}
                        values={values}
                        touched={touched}
                        errors={errors}
                        setFieldValue={setFieldValue}
                        dataRes={contractData?.buyerInformation}
                        // suppliers={grDetailsState.suppliers}
                        // companyUuid={grDetailsState.companyUuid}
                        // modeView={grDetailsState.modeView}
                    />
                )}
                {permissionReducer?.isBuyer && (
                    <SupplierInfo
                        t={t}
                        disabled={!values.isEdit}
                        contractStatus={values.status}
                        values={values}
                        touched={touched}
                        errors={errors}
                        setFieldValue={setFieldValue}
                        suppliers={suppliers}
                        addresses={addresses}
                        companyUuid={companyUuid}
                    />
                )}
            </Col>
            <Col xs={6}>
                {/* General Information Section */}
                <Card className="mb-3">
                    <CardHeader tag="h6">{t("GeneralInformation")}</CardHeader>
                    <CardBody>
                        <HorizontalInput
                            name="contractTitle"
                            label={t("Contract Title")}
                            type="text"
                            placeholder={t("Contract Title")}
                            className="label-required"
                            errors={errors.contractTitle}
                            touched={touched.contractTitle}
                            value={values.contractTitle}
                            disabled={!values.isEdit}
                            onChange={handleChange}
                        />
                        <SelectInput
                            name="procurementType"
                            label={t("ProcurementType")}
                            className="label-required"
                            placeholder={t("PleaseSelectProcurementType")}
                            errors={errors.procurementType}
                            touched={touched.procurementType}
                            options={procurementTypes}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.procurementType}
                            disabled={!values.isEdit}
                            disabledValue={contractData?.procurementType}
                        />
                        <SelectInput
                            name="approvalRoute"
                            label={t("ApprovalRoute")}
                            className="label-required"
                            placeholder={t("PleaseSelectApprovalRoute")}
                            options={approvalRoutes}
                            optionLabel="approvalName"
                            optionValue="uuid"
                            value={values.approvalRoute}
                            errors={errors.approvalRoute}
                            touched={touched.approvalRoute}
                            onChange={(e) => onChangeApprovalRoute(
                                e, setFieldValue
                            )}
                            disabled={!values.isEdit}
                            disabledValue={contractData?.approvalRouteName}

                        />
                        <HorizontalInput
                            name="approvalRouteSequence"
                            label={t("Approver Sequence")}
                            type="text"
                            placeholder={t("Approver Sequence")}
                            className="optional"
                            onChange={handleChange}
                            value={values.approvalRouteSequence}
                            disabled
                        />
                        <HorizontalInput
                            name="createdBy"
                            label={t("Requester")}
                            type="text"
                            placeholder={t("Requester")}
                            errors={errors.createdBy}
                            touched={touched.createdBy}
                            value={values.createdBy}
                            disabled
                        />
                        <HorizontalInput
                            name="createdDate"
                            label={t("Submitted Date")}
                            type="text"
                            placeholder={t("Submitted Date")}
                            className="optional"
                            onChange={handleChange}
                            value={values.createdDate}
                            disabled
                        />
                        <Row>
                            <Col lg={4}>
                                <Label className={["p-0", classes["outsourcing-label"]].join(" ")}>eSign Routing?</Label>
                            </Col>
                            <Col lg={8}>
                                <Checkbox
                                    name="eSignRouting"
                                    label="eSign Routing?"
                                    type="checkbox"
                                    checked={values.eSignRouting}
                                    className={`${classes.checkBox}`}
                                    value={values.eSignRouting}
                                    onChange={() => {
                                        onChangeEsign(setFieldValue, values);
                                    }}
                                    disabled={!values.isEdit}
                                />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                {/* Request Terms Section */}
                <Card>
                    <CardHeader tag="h6">{t("Request Terms")}</CardHeader>
                    <CardBody>
                        <HorizontalInput
                            name="paymentTermName"
                            className="label-required"
                            label={t("Payment Term")}
                            text="text"
                            value={values.paymentTermName}
                            placeholder=""
                            disabled
                        />
                        <SelectInput
                            name="deliveryAddress"
                            label={t("DeliveryAddress")}
                            className="label-required"
                            placeholder={t("DeliveryAddress")}
                            options={addresses}
                            optionLabel="addressLabel"
                            optionValue="addressLabel"
                            onChange={handleChange}
                            errors={errors.deliveryAddress}
                            touched={touched.deliveryAddress}
                            value={values.deliveryAddress}
                            disabled={!values.isEdit}
                            disabledValue={contractData?.deliveryAddress?.addressLabel}
                        />
                        <HorizontalInput
                            id="contractStartDate"
                            name="contractStartDate"
                            label={t("Contract Start Date")}
                            type="date"
                            placeholder={t("Contract Start Date")}
                            className="label-required"
                            onChange={handleChange}
                            value={values.contractStartDate}
                            errors={errors.contractStartDate}
                            touched={touched.contractStartDate}
                            disabled={!values.isEdit}
                        />
                        <HorizontalInput
                            id="contractEndDate"
                            name="contractEndDate"
                            label={t("Contract End Date")}
                            type="date"
                            placeholder={t("Contract End Date")}
                            className="label-required"
                            onChange={handleChange}
                            value={values.contractEndDate}
                            errors={errors.contractEndDate}
                            touched={touched.contractEndDate}
                            disabled={!values.isEdit}
                        />
                        <SelectInput
                            name="renewalOption"
                            label={t("Renewal Type")}
                            className="label-required"
                            placeholder={t("Please Select Renewal Type")}
                            errors={errors.renewalOption}
                            touched={touched.renewalOption}
                            options={renewalOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.renewalOption}
                            disabled={!values.isEdit}
                        />
                        <HorizontalInput
                            name="note"
                            label={t("Notes")}
                            type="textarea"
                            maxLength={3000}
                            placeholder={t("EnterNote")}
                            errors={errors.note}
                            rows={4}
                            touched={touched.note}
                            value={values.note}
                            className="mb-0"
                            disabled={!values.isEdit}
                        />
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default GeneralInformation;
