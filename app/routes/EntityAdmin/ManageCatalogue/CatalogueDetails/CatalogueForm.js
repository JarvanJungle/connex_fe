import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AvField } from "availity-reactstrap-validation";
import {
    Col, Row, Card, Label,
    CustomInput, CardBody,
    CardHeader, FormGroup
} from "components";
import { v4 as uuidv4 } from "uuid";
import { formatDisplayDecimal, isNullOrUndefined } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import Select, { createFilter } from "react-select";
import classes from "./CatalogueDetails.scss";

const CatalogueForm = (props) => {
    const {
        isCreate,
        isEdit,
        form,
        updateForm,
        changeItemCode,
        handleChangeSupplierCode,
        handleChangeTaxCode,
        handleChangeIsActive,
        handleChangeIsContracted,
        uomList,
        categoryList,
        projectList,
        supplierList,
        taxList,
        currencyList,
        headerName,
        glList,
        isContracted
    } = props;
    const { t } = useTranslation();
    let tenYearAgo = new Date();
    tenYearAgo.setFullYear(tenYearAgo.getFullYear() - 10);
    tenYearAgo = tenYearAgo.toJSON().split("T")[0];
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProjects, setSelectedProjects] = useState([]);

    useEffect(() => {
        const supplier = supplierList?.find(({ companyCode }) => companyCode === form.supplierCode);
        setSelectedSupplier(supplier && ({
            value: supplier?.companyCode,
            label: supplier?.companyLabel
        }));
    }, [form.supplierCode]);

    useEffect(() => {
        const account = glList?.find(({ accountNumber }) => accountNumber === form.glAccountNumber);
        setSelectedAccount(account && ({
            value: account?.accountNumber,
            label: `${account.accountNumber} ${account.description ? `(${account.description})` : ""}`
        }));
    }, [form.glAccountNumber]);

    useEffect(() => {
        if (form?.projects) {
            const projects = [];
            form?.projects.forEach((item) => {
                const project = projectList.find((element) => element.uuid === item);
                projects.push({
                    label: project.projectCode,
                    value: project.uuid
                });
            });
            setSelectedProjects(projects);
        }
        const account = glList?.find(({ accountNumber }) => accountNumber === form.glAccountNumber);
        setSelectedAccount(account && ({
            value: account?.accountNumber,
            label: `${account.accountNumber} ${account.description ? `(${account.description})` : ""}`
        }));
    }, [form?.projects]);

    const customSelectStyle = {
        control: (styles) => (isCreate
            ? styles
            : ({
                ...styles,
                backgroundColor: "#f9fafc",
                color: "#5D636D",
                cursor: "not-allowed"
            }))
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {headerName}
            </CardHeader>
            <CardBody className="p-4">
                <FormGroup>
                    <Row xs="5" className="d-flex justify-content-around align-items-center mx-0">
                        <Col xs={3}>
                            <FormGroup>
                                <CustomInput
                                    type="checkbox"
                                    name="contracted"
                                    id="checkboxesStackedCustom1"
                                    label=" Contracted Item"
                                    checked={form.contracted}
                                    onChange={handleChangeIsContracted}
                                    className={`${classes.checkBox}`}
                                    disabled={(!isEdit && form.contracted) || isContracted}
                                />
                            </FormGroup>
                        </Col>
                        {(form.contracted) && (
                            <Col xs="3 label-required">
                                <AvField
                                    type="text"
                                    name="contractedRefNo"
                                    label={t("ContractReferenceNo")}
                                    placeholder={t("EnterContractReferenceNo")}
                                    validate={{
                                        required: { value: true, errorMessage: t("PleaseEnterValidContractReferenceNo") }
                                    }}
                                    disabled={(!isEdit && form.contracted) || isContracted}
                                    value={form.contractedRefNo}
                                    onChange={(e) => { updateForm("contractedRefNo", e.target.value); }}
                                />
                            </Col>
                        )}
                        {!(form.contracted) && (<Col xs="3" />)}
                        <Col xs="3" />
                        <Col xs="3" />
                    </Row>
                    <Row xs="5" className="d-flex justify-content-around mx-0">
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                type="text"
                                name="catalogueItemCode"
                                label={t("ItemCode")}
                                placeholder={t("EnterItemCode")}
                                validate={{
                                    required: { value: true, errorMessage: t("ItemCodeIsRequired") }
                                }}
                                disabled={!isCreate}
                                value={form.catalogueItemCode}
                                onBlur={(e) => { changeItemCode(e.target.value); }}
                            />
                        </Col>
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                type="text"
                                name="catalogueItemName"
                                label={t("ItemName")}
                                placeholder={t("EnterItemName")}
                                validate={{
                                    required: { value: true, errorMessage: t("ItemNameIsRequired") },
                                    maxLength: { value: 200, errorMessage: t("Item name must be less than 200 characters") }
                                }}
                                value={form.catalogueItemName}
                                onChange={(e) => { updateForm("catalogueItemName", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            />
                        </Col>
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                label={`${t("Category")}`}
                                type="select"
                                name="itemCategory"
                                value={form.itemCategory}
                                validate={{
                                    required: { value: true, errorMessage: t("CategoryRequired") }
                                }}
                                onChange={(e) => {
                                    updateForm("itemCategory", e.target.value);
                                }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            >
                                <option disabled value="">{t("PleaseSelectAValue")}</option>
                                {
                                    categoryList.map((value) => {
                                        if (value.active === true) {
                                            return (
                                                <option
                                                    key={uuidv4()}
                                                    value={value.categoryName}
                                                >
                                                    {value.categoryName}
                                                </option>
                                            );
                                        }
                                        return (<></>);
                                    })
                                }
                            </AvField>
                        </Col>
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                label={`${t("UOM")}`}
                                type="select"
                                name="uomCode"
                                value={form.uomCode}
                                validate={{
                                    required: { value: true, errorMessage: t("UOMIsRequired") }
                                }}
                                onChange={(e) => { updateForm("uomCode", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            >
                                <option disabled value="">{t("PleaseSelectAValue")}</option>
                                {
                                    // eslint-disable-next-line
                                    isCreate ? uomList.map((value) => {
                                        if (value.active === true) {
                                            return (
                                                <option
                                                    key={uuidv4()}
                                                    value={value.uomCode}
                                                >
                                                    {value.uomName}
                                                </option>
                                            );
                                        }
                                    }) : uomList.map((value) => (
                                        <option
                                            key={uuidv4()}
                                            value={value.uomCode}
                                        >
                                            {value.uomName}
                                        </option>
                                    ))
                                }
                            </AvField>
                        </Col>
                        <Col xs="3" className={`${classes["label-required"]}`} />
                    </Row>
                    <Row xs="5" className="d-flex justify-content-around mx-0">
                        <Col xs="3">
                            <Label className="p-0">{t("CatalogueSupplierCode")}</Label>
                            <Select
                                value={selectedSupplier}
                                onChange={({ value }) => handleChangeSupplierCode(value)}
                                styles={customSelectStyle}
                                options={supplierList.map(({ companyCode, companyLabel }) => ({
                                    label: companyLabel,
                                    value: companyCode
                                }))}
                                isDisabled={!isCreate}
                                isSearchable
                            />
                        </Col>
                        <Col xs="3">
                            <AvField
                                type="text"
                                name="supplierName"
                                label={t("CatalogueSupplierName")}
                                placeholder={t("CatalogueSupplierName")}
                                value={form.supplierName}
                                disabled
                                onChange={(e) => { updateForm("supplierName", e.target.value); }}
                            />
                        </Col>
                        <Col xs="3">
                            <AvField
                                label={t("TaxCode")}
                                type="select"
                                name="taxCode"
                                value={form.taxCode}
                                onChange={(e) => handleChangeTaxCode(e.target.value)}
                                disabled={!isEdit || !isCreate}
                            >
                                <option disabled value="">{t("PleaseSelectAValue")}</option>
                                {
                                    // eslint-disable-next-line
                                    isCreate ? taxList.map((value) => {
                                        if (value.active) {
                                            return (
                                                <option
                                                    key={uuidv4()}
                                                    value={value.companyCode}
                                                >
                                                    {value.taxCode}
                                                </option>
                                            );
                                        }
                                    }) : taxList.map((value) => (
                                        <option
                                            key={uuidv4()}
                                            value={value.companyCode}
                                        >
                                            {value.taxCode}
                                        </option>
                                    ))
                                }
                            </AvField>
                        </Col>
                        <Col xs="3">
                            <AvField
                                type="text"
                                name="taxPercent"
                                label={t("CatalogueTaxPercentage")}
                                placeholder={t("CatalogueTaxPercentage")}
                                value={form.taxRate !== 0 ? formatDisplayDecimal(form.taxRate,
                                    CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER) : "0.00"}
                                disabled
                                onChange={(e) => { updateForm("taxRate", e.target.value); }}
                            />
                        </Col>
                    </Row>
                    <Row xs="5" className="d-flex justify-content-around mx-0">
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                label={t("CatalogueCurrency")}
                                type="select"
                                name="currencyCode"
                                value={form.currencyCode}
                                validate={{
                                    required: { value: true, errorMessage: t("CurrencyRequired") }
                                }}
                                onChange={(e) => { updateForm("currencyCode", e.target.value); }}
                                disabled={!isCreate}
                            >
                                <option disabled value="">{t("PleaseSelectAValue")}</option>
                                {
                                    // eslint-disable-next-line
                                    isCreate ? currencyList.map((value) => {
                                        if (value.active) {
                                            return (
                                                <option
                                                    key={uuidv4()}
                                                    value={value.currencyCode}
                                                >
                                                    {`${value.currencyName} (+${value.currencyCode})`}
                                                </option>
                                            );
                                        }
                                    }) : currencyList.map((value) => (
                                        <option
                                            key={uuidv4()}
                                            value={value.currencyCode}
                                        >
                                            {`${value.currencyName} (+${value.currencyCode})`}
                                        </option>
                                    ))
                                }
                            </AvField>
                        </Col>
                        <Col xs="3" className={`${classes["label-required"]}`}>
                            <AvField
                                type="text"
                                name="unitPrice"
                                label={t("CatalogueLatestPrice")}
                                placeholder={t("EnterCatalogueLatestPrice")}
                                validate={{
                                    required: { value: true, errorMessage: t("LatestPriceIsRequired") }
                                }}
                                value={form.unitPrice}
                                onBlur={() => {
                                    updateForm("unitPrice", form.unitPrice);
                                }}
                                onChange={(e) => { updateForm("unitPrice", e.target.value); }}
                                disabled={!isEdit}
                            />
                        </Col>
                        <Col xs="3" className={form?.contracted && "label-required"}>
                            <AvField
                                type="date"
                                name="validFrom"
                                validate={{
                                    min: { value: tenYearAgo, errorMessage: t(`Valid To must be later than ${new Date(tenYearAgo).toLocaleDateString()}`) },
                                    required: { value: form?.contracted, errorMessage: t("ValidFromIsRequired") }
                                }}
                                label={t("CatalogueValidFrom")}
                                placeholder={t("CatalogueValidFrom")}
                                value={form.validFrom}
                                onChange={(e) => { updateForm("validFrom", e.target.value); }}
                                disabled={!isEdit}
                            />
                        </Col>
                        <Col xs="3" className={form?.contracted && "label-required"}>
                            <AvField
                                type="date"
                                name="validTo"
                                label={t("CatalogueValidTo")}
                                placeholder={t("CatalogueValidTo")}
                                validate={{
                                    min: form.validFrom ? { value: form.validFrom, errorMessage: t("Valid To must be later than Valid From") } : { value: tenYearAgo, errorMessage: t(`Valid To must be later than ${new Date(tenYearAgo).toLocaleDateString()}`) },
                                    required: { value: form?.contracted, errorMessage: t("ValidToIsRequired") }
                                }}
                                value={form.validTo}
                                onChange={(e) => { updateForm("validTo", e.target.value); }}
                                disabled={!isEdit}
                            />
                        </Col>
                    </Row>
                    <Row xs="5" className="d-flex justify-content-around align-items-center mx-0">
                        <Col xs="3">
                            <AvField
                                type="textarea"
                                rows={1}
                                name="description"
                                label={`${t("CatalogueDescription")}`}
                                validate={{
                                    maxLength: { value: 500, errorMessage: t("Catalogue Description must be less than 500 characters") }
                                }}
                                placeholder={t("EnterCatalogueDescription")}
                                value={form.description}
                                onChange={(e) => { updateForm("description", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            />
                        </Col>
                        <Col xs="3">
                            <AvField
                                type="text"
                                name="itemModel"
                                validate={{
                                    maxLength: { value: 100, errorMessage: t("itemModel must be less than 100 characters") }
                                }}
                                label={`${t("CatalogueModel")}`}
                                placeholder={t("EnterCatalogueModel")}
                                value={form.itemModel}
                                onChange={(e) => { updateForm("itemModel", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            />
                        </Col>
                        <Col xs="3">
                            <AvField
                                type="textarea"
                                rows={1}
                                name="itemSize"
                                validate={{
                                    maxLength: { value: 500, errorMessage: t("itemSize must be less than 500 characters") }
                                }}
                                label={`${t("CatalogueSize")}`}
                                placeholder={t("EnterCatalogueSize")}
                                value={form.itemSize}
                                onChange={(e) => { updateForm("itemSize", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            />
                        </Col>
                        <Col xs="3">
                            <AvField
                                type="text"
                                name="itemBrand"
                                validate={{
                                    maxLength: { value: 100, errorMessage: t("itemBrand must be less than 100 characters") }
                                }}
                                label={`${t("CatalogueBrand")}`}
                                placeholder={t("EnterCatalogueBrand")}
                                value={form.itemBrand}
                                onChange={(e) => { updateForm("itemBrand", e.target.value); }}
                                disabled={!isEdit || form.lockItemName || !isCreate}
                            />
                        </Col>
                    </Row>
                    <Row xs="5" className="d-flex mx-0">
                        <Col xs="3">
                            <div className="form-group">
                                <Label className="p-0">{t("G/L Account")}</Label>
                                <Select
                                    value={selectedAccount}
                                    onChange={({ value }) => updateForm("glAccountNumber", value)}
                                    styles={{
                                        ...customSelectStyle
                                    }}
                                    options={glList.map(({ accountNumber, description }) => ({
                                        label: `${accountNumber} ${description ? `(${description})` : ""}`,
                                        value: accountNumber
                                    }))}
                                    isDisabled={!isCreate}
                                    isSearchable
                                />
                            </div>
                            <FormGroup>
                                <CustomInput
                                    type="checkbox"
                                    name="active"
                                    id="checkboxesStackedCustom2"
                                    label="Set Active Status"
                                    checked={form.isActive}
                                    onChange={handleChangeIsActive}
                                    className={`${classes["z-index-0"]}`}
                                    disabled={!isEdit}
                                />
                            </FormGroup>
                        </Col>
                        {(form?.contracted) && (
                            <Col xs="3">
                                <AvField
                                    type="text"
                                    name="contractedQty"
                                    label={t("ContractedQuantity")}
                                    placeholder={t("EnterContractedQuantity")}
                                    validate={{
                                        number: { value: true, errorMessage: t("PleaseEnterValidContractedQty") }
                                    }}
                                    value={form.contractedQty || ""}
                                    onChange={(e) => { updateForm("contractedQty", e.target.value); }}
                                    disabled={!isEdit}
                                />
                            </Col>
                        )}
                        {(form?.contracted) && (
                            <Col xs="3 label-required">
                                <AvField
                                    type="text"
                                    name="contractedPrice"
                                    label={t("ContractedPrice")}
                                    placeholder={t("EnterContractedPrice")}
                                    validate={{
                                        number: { value: true, errorMessage: t("PleaseEnterValidContractedPrice") },
                                        required: { value: form?.contracted, errorMessage: t("PleaseEnterValidContractedPrice") },
                                        greaterThanZero: (value) => {
                                            if (!isNullOrUndefined(value) && value !== "" && Number(value) <= 0) {
                                                return t("ContractedPriceCannotBeGreaterThanZero");
                                            }
                                            return true;
                                        }
                                    }}
                                    value={form.contractedPrice || ""}
                                    onChange={(e) => { updateForm("contractedPrice", e.target.value); }}
                                    disabled={!isEdit}
                                />
                            </Col>
                        )}
                        {(form?.contracted) && (
                            <Col xs="3">
                                <Label className="p-0">{t("Project")}</Label>
                                <Select
                                    value={selectedProjects ?? []}
                                    onChange={(projects) => {
                                        const projectUuids = projects.map(({ value }) => value);
                                        updateForm("projects", projectUuids);
                                    }}
                                    styles={{
                                        control: (styles) => (isEdit || isCreate
                                            ? styles
                                            : ({
                                                ...styles,
                                                backgroundColor: "#f9fafc",
                                                color: "#5D636D",
                                                cursor: "not-allowed"
                                            }))
                                    }}
                                    options={projectList.map(({ projectCode, uuid }) => ({
                                        label: projectCode,
                                        value: uuid
                                    }))}
                                    placeholder={t("SelectProject")}
                                    isDisabled={!isEdit}
                                    isSearchable
                                    isMulti
                                    filterOption={createFilter({
                                        ignoreCase: true,
                                        ignoreAccents: true,
                                        matchFrom: "any",
                                        stringify: (option) => option.label,
                                        trim: true
                                    })}
                                />
                            </Col>
                        )}
                    </Row>
                </FormGroup>
            </CardBody>
        </Card>
    );
};

CatalogueForm.propTypes = {
    isCreate: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    form: PropTypes.instanceOf(Object).isRequired,
    updateForm: PropTypes.func.isRequired,
    handleChangeSupplierCode: PropTypes.func.isRequired,
    handleChangeTaxCode: PropTypes.func.isRequired,
    handleChangeIsActive: PropTypes.func.isRequired,
    uomList: PropTypes.instanceOf(Array).isRequired,
    supplierList: PropTypes.instanceOf(Array).isRequired,
    taxList: PropTypes.instanceOf(Array).isRequired,
    currencyList: PropTypes.instanceOf(Array).isRequired
};

export default CatalogueForm;
