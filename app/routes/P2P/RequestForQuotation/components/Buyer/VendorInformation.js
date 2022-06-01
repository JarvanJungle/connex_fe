/* eslint-disable max-len */
/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { ErrorMessage } from "formik";
import ExtVendorService from "services/ExtVendorService";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";

const VendorInformation = (props) => {
    const {
        t, errors,
        touched,
        vendors,
        setFieldValue,
        setTouched,
        values,
        companyUuid,
        contactPersons,
        setContactPersons,
        disabled,
        prevVendors,
        loading
    } = props;
    const containedSupplier = (uuid) => values.vendors.some((item) => item.supplierUuid === uuid);

    const onChangeVendor = async (e) => {
        const { value } = e.target;
        const newVendors = values.vendors;
        const vendor = vendors.find((item) => item.uuid === value);
        if (!values.vendors?.find((item) => item.supplierUuid === value)) {
            const responseVendorDetails = await ExtVendorService
                .getExternalVendorDetails(companyUuid, value);
            const { supplierUserList } = responseVendorDetails.data.data;
            const defaultContact = supplierUserList.find((item) => item.default === true);
            newVendors.push({
                supplierName: vendor?.companyName,
                supplierUuid: value,
                contactPersonName: defaultContact.fullName,
                contactPersonEmail: defaultContact.emailAddress
            });
            setContactPersons((prevStates) => ({
                ...prevStates,
                [value]: supplierUserList
            }));
            setFieldValue("vendors", newVendors);
        }
    };

    const onChangeContactPerson = (e, supplierUuid) => {
        const newVendors = values.vendors;
        const listContactPerson = contactPersons[supplierUuid];
        const contactPerson = listContactPerson.find(
            (item) => item.emailAddress === e.target.value
        );
        newVendors.forEach((item, index) => {
            if (item.supplierUuid === supplierUuid) {
                newVendors[index].contactPersonName = contactPerson.fullName;
                newVendors[index].contactPersonEmail = e.target.value;
            }
        });
        setFieldValue("vendors", newVendors);
    };

    const removeVendor = (supplierUuid) => {
        const newVendors = values.vendors.filter((item) => item.supplierUuid !== supplierUuid);
        setFieldValue("vendors", newVendors);
    };

    const addCustomVendor = () => {
        const newVendors = values.vendors;
        newVendors.push({
            supplierName: "",
            supplierUuid: "",
            contactPersonName: "",
            contactPersonEmail: "",
            isNew: true
        });
        setFieldValue("vendors", newVendors);
    };

    return (
        <Card>
            <CardHeader tag="h6" loading={loading}>
                {t("VendorInformation")}
            </CardHeader>
            <CardBody>
                <>
                    {!values.isUpdate && (
                        <>
                            <Row className="">
                                <Col xs={4} className="label-required">
                                    {!loading && (<Label className="p-0">{t("Vendor")}</Label>)}
                                    {loading && (<div className="phl-col-6" />)}
                                </Col>
                                <Col xs={8}>
                                    {!loading && (
                                        <div className="d-flex align-items-center">
                                            <b style={{ cursor: "pointer" }} className="mr-1" onClick={addCustomVendor} aria-hidden="true">+</b>
                                            <select
                                                name="vendors"
                                                type="select"
                                                className={`${"form-control"}${errors.vendors && touched.vendors ? " is-invalid" : ""}`}
                                                onChange={onChangeVendor}
                                                disabled={disabled}
                                                onBlur={() => {
                                                    if (!touched.vendors) {
                                                        setTouched({ ...touched, vendors: true });
                                                    }
                                                }}
                                                value=""
                                            >
                                                {
                                                    values.vendors.length > 0
                                                        ? <option value="" hidden>{`${values.vendors.length} vendors selected`}</option>
                                                        : <option hidden value="">{t("PleaseSelectAVendor")}</option>
                                                }
                                                {vendors.map((option) => (
                                                    <React.Fragment key={uuidv4()}>
                                                        {containedSupplier(option.uuid) && (
                                                            <option key={uuidv4()} value={option.uuid}>
                                                                {option.companyName}
                                                            </option>
                                                        )}
                                                        {!containedSupplier(option.uuid) && (
                                                            <option key={uuidv4()} value={option.uuid}>
                                                                {`${option.companyName} (${option.companyCode})`}
                                                            </option>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                            <ErrorMessage name="vendors" component="div" className="invalid-feedback" />
                                        </div>
                                    )}
                                    {loading && (<div className="phl-col-12" />)}
                                </Col>
                            </Row>
                            {values?.vendors?.length > 0 && (
                                <Row>
                                    <Col xs={6}>
                                        <Row className="mx-0 justify-content-between">
                                            {!loading && (<Label className="p-0">{t("SelectedVendors")}</Label>)}
                                            {loading && (<div className="phl-col-6" />)}
                                            {!disabled && (
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={() => setFieldValue("vendors", [])}
                                                    style={{
                                                        color: "#4472C4",
                                                        border: "unset",
                                                        cursor: "pointer",
                                                        background: "unset",
                                                        textDecoration: "underline",
                                                        padding: 0,
                                                        textAlign: "left",
                                                        minWidth: "unset",
                                                        paddingBottom: "10px"
                                                    }}
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                            {disabled && (<></>)}
                                        </Row>
                                        <div className="mt-1">
                                            {!loading && values.vendors.map((selected, index) => {
                                                if (selected.isNew) {
                                                    return (
                                                        <Row
                                                            className="justify-content-between mx-0 align-content-center form-group"
                                                            key={`${index}-custom-supplierName`}
                                                        >
                                                            <input
                                                                style={{ width: "90%" }}
                                                                value={selected.supplierName}
                                                                placeholder="Please enter Vendor Name"
                                                                name="supplierName"
                                                                disabled={disabled}
                                                                className="form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].supplierName`, e.target.value);
                                                                }}
                                                            />
                                                            {disabled && (<></>)}
                                                            {!disabled && (
                                                                <button
                                                                    type="button"
                                                                    className="p-0 btn-xs pull-right"
                                                                    onClick={() => removeVendor(selected.supplierUuid)}
                                                                    style={{
                                                                        minWidth: "unset",
                                                                        padding: 0,
                                                                        border: "none",
                                                                        background: "#fff",
                                                                        ":focus": {
                                                                            boxShadow: "none"
                                                                        }
                                                                    }}
                                                                >
                                                                    <span className="fa fa-close close-button" aria-hidden="true" />
                                                                </button>
                                                            )}
                                                        </Row>
                                                    );
                                                }
                                                return (
                                                    <Row
                                                        className="justify-content-between mx-0 align-content-center form-group"
                                                        style={{
                                                            height: "calc(1.6em + 0.75rem + 2px)",
                                                            padding: "0.375rem 0"
                                                        }}
                                                        key={uuidv4()}
                                                    >
                                                        <span>{selected.supplierName}</span>
                                                        {disabled && (<></>)}
                                                        {!disabled && (
                                                            <button
                                                                type="button"
                                                                className="p-0 btn-xs pull-right"
                                                                onClick={() => removeVendor(selected.supplierUuid)}
                                                                style={{
                                                                    minWidth: "unset",
                                                                    padding: 0,
                                                                    border: "none",
                                                                    background: "#fff",
                                                                    ":focus": {
                                                                        boxShadow: "none"
                                                                    }
                                                                }}
                                                            >
                                                                <span className="fa fa-close close-button" aria-hidden="true" />
                                                            </button>
                                                        )}
                                                    </Row>
                                                );
                                            })}
                                            {loading && (<div className="phl-col-8" />)}
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <Row className="mx-0 justify-content-start label-required">
                                            {!loading && (<Label className="p-0">{t("ContactPerson")}</Label>)}
                                            {loading && (<div className="phl-col-6" />)}
                                        </Row>
                                        <ul className="pl-0 mt-1">
                                            {!loading && values?.vendors.map((vendor, index) => {
                                                if (vendor.isNew) {
                                                    return (
                                                        <div style={{ marginBottom: "16px" }} className="d-flex" key={`${index}-custom-supplierName`}>
                                                            <input
                                                                style={{ width: "48%" }}
                                                                placeholder="Please enter Email Address"
                                                                value={vendor.contactPersonEmail}
                                                                name="contactPersonEmail"
                                                                disabled={disabled}
                                                                className="mr-2 form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].contactPersonEmail`, e.target.value);
                                                                }}
                                                            />
                                                            <span style={{ width: "4%" }} />
                                                            <input
                                                                style={{ width: "48%" }}
                                                                placeholder="Please enter Person Name"
                                                                value={vendor.contactPersonName}
                                                                name="contactPersonName"
                                                                disabled={disabled}
                                                                className="form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].contactPersonName`, e.target.value);
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <select
                                                        disabled={disabled}
                                                        key={uuidv4()}
                                                        className={classNames("form-control form-group")}
                                                        onChange={(e) => {
                                                            onChangeContactPerson(
                                                                e,
                                                                vendor.supplierUuid
                                                            );
                                                        }}
                                                        value={values.vendors[index]?.contactPersonEmail ?? ""}
                                                    >
                                                        <option value="" hidden defaultValue>{t("PleaseSelectAContactPerson")}</option>
                                                        {(contactPersons[
                                                            vendor.supplierUuid
                                                        ] || [])
                                                            .map((option) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={option.emailAddress}
                                                                >
                                                                    {option.fullName}
                                                                </option>
                                                            ))}
                                                    </select>
                                                );
                                            })}
                                            {loading && (<div className="phl-col-8" />)}
                                        </ul>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                    {values.isUpdate && (
                        <>
                            <Row className="form-group label-required">
                                <Col xs={4}>
                                    {!loading && (<Label className="p-0">{t("Vendor")}</Label>)}
                                    {loading && (<div className="phl-col-6" />)}
                                </Col>
                                <Col xs={8}>
                                    {!loading && (
                                        <div className="d-flex align-items-center">

                                            <b style={{ cursor: "pointer" }} className="mr-1" onClick={addCustomVendor} aria-hidden="true">+</b>
                                            <select
                                                name="vendors"
                                                type="select"
                                                className={`${"form-control"}${errors.vendors && touched.vendors ? " is-invalid" : ""}`}
                                                onChange={onChangeVendor}
                                                value=""
                                            >
                                                {
                                                    values.vendors.length > 0
                                                        ? <option value="" hidden>{`${values.vendors.length} vendors selected`}</option>
                                                        : <option hidden value="">{t("PleaseSelectAVendor")}</option>
                                                }
                                                {vendors.map((option) => (
                                                    <React.Fragment key={uuidv4()}>
                                                        {containedSupplier(option.uuid) && (
                                                            <option key={uuidv4()} value={option.uuid}>
                                                                {option.companyName}
                                                            </option>
                                                        )}
                                                        {!containedSupplier(option.uuid) && (
                                                            <option key={uuidv4()} value={option.uuid}>
                                                                {`${option.companyName} (${option.companyCode})`}
                                                            </option>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                            <ErrorMessage name="vendors" component="div" className="invalid-feedback" />
                                        </div>
                                    )}
                                    {loading && (<div className="phl-col-12" />)}
                                </Col>
                            </Row>
                            {values?.vendors?.length > 0 && (
                                <Row>
                                    <Col xs={6}>
                                        <Row className="mx-0 justify-content-start">
                                            {!loading && (<Label className="p-0">{t("SelectedVendors")}</Label>)}
                                            {loading && (<div className="phl-col-6" />)}
                                        </Row>
                                        <div className="mt-1">
                                            {!loading && values.vendors.map((selected, index) => {
                                                if (selected.isNew) {
                                                    return (
                                                        <Row
                                                            className="justify-content-between mx-0 align-content-center form-group"
                                                            key={`${index}-custom-supplierName`}
                                                        >
                                                            <input
                                                                style={{ width: "90%" }}
                                                                value={selected.supplierName}
                                                                placeholder="Please enter Vendor Name"
                                                                name="supplierName"
                                                                disabled={prevVendors.includes(selected.supplierUuid)}
                                                                className="form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].supplierName`, e.target.value);
                                                                }}
                                                            />
                                                            {disabled && (<></>)}
                                                            {!prevVendors.includes(selected.supplierUuid) && (
                                                                <button
                                                                    type="button"
                                                                    className="p-0 btn-xs pull-right"
                                                                    onClick={() => removeVendor(selected.supplierUuid)}
                                                                    style={{
                                                                        minWidth: "unset",
                                                                        padding: 0,
                                                                        border: "none",
                                                                        background: "#fff",
                                                                        ":focus": {
                                                                            boxShadow: "none"
                                                                        }
                                                                    }}
                                                                >
                                                                    <span className="fa fa-close close-button" aria-hidden="true" />
                                                                </button>
                                                            )}
                                                        </Row>
                                                    );
                                                }
                                                return (
                                                    <Row
                                                        className="justify-content-between mx-0 align-content-center form-group"
                                                        style={{
                                                            height: "calc(1.6em + 0.75rem + 2px)",
                                                            padding: "0.375rem 0"
                                                        }}
                                                        key={uuidv4()}
                                                    >
                                                        <span>{selected.supplierName}</span>
                                                        {prevVendors.includes(selected.supplierUuid) && (<></>)}
                                                        {!prevVendors.includes(selected.supplierUuid) && (
                                                            <button
                                                                type="button"
                                                                className="p-0 btn-xs pull-right"
                                                                onClick={() => removeVendor(selected.supplierUuid)}
                                                                style={{
                                                                    minWidth: "unset",
                                                                    padding: 0,
                                                                    border: "none",
                                                                    background: "#fff",
                                                                    ":focus": {
                                                                        boxShadow: "none"
                                                                    }
                                                                }}
                                                            >
                                                                <span className="fa fa-close close-button" aria-hidden="true" />
                                                            </button>
                                                        )}
                                                    </Row>
                                                )
                                            }
                                            )}
                                            {loading && (<div className="phl-col-8" />)}
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <Row className="mx-0 justify-content-start label-required">
                                            {!loading && (<Label className="p-0">{t("ContactPerson")}</Label>)}
                                            {loading && (<div className="phl-col-6" />)}
                                        </Row>
                                        <ul className="pl-0 mt-1">
                                            {!loading && values?.vendors.map((vendor, index) => {
                                                if (vendor.isNew) {
                                                    return (
                                                        <div style={{ marginBottom: "16px" }} className="d-flex" key={`${index}-custom-supplierName`}>
                                                            <input
                                                                style={{ width: "48%" }}
                                                                placeholder="Please enter Email Address"
                                                                value={vendor.contactPersonEmail}
                                                                name="contactPersonEmail"
                                                                disabled={prevVendors.includes(vendor.supplierUuid)}
                                                                className="mr-2 form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].contactPersonEmail`, e.target.value);
                                                                }}
                                                            />
                                                            <span style={{ width: "4%" }} />
                                                            <input
                                                                style={{ width: "48%" }}
                                                                placeholder="Please enter Person Name"
                                                                value={vendor.contactPersonName}
                                                                name="contactPersonName"
                                                                disabled={prevVendors.includes(vendor.supplierUuid)}
                                                                className="form-control"
                                                                onChange={(e) => {
                                                                    setFieldValue(`vendors.[${index}].contactPersonName`, e.target.value);
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <React.Fragment key={uuidv4()}>
                                                        <select
                                                            disabled={prevVendors.includes(vendor.supplierUuid)}
                                                            key={uuidv4()}
                                                            className={classNames("form-control form-group")}
                                                            onChange={(e) => {
                                                                onChangeContactPerson(
                                                                    e,
                                                                    vendor.supplierUuid,
                                                                    index
                                                                );
                                                            }}
                                                            value={values.vendors[index]?.contactPersonEmail ?? ""}
                                                        >
                                                            <option value="" hidden defaultValue>{t("PleaseSelectAContactPerson")}</option>
                                                            {(contactPersons[
                                                                vendor.supplierUuid
                                                            ] || [])
                                                                .map((option) => (
                                                                    <option
                                                                        key={uuidv4()}
                                                                        value={option.emailAddress}
                                                                    >
                                                                        {option.fullName}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </React.Fragment>
                                                );
                                            })}
                                            {loading && (<div className="phl-col-12" />)}
                                        </ul>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                </>
            </CardBody>
        </Card>
    );
};

export default VendorInformation;
