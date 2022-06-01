import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    Row,
    Col,
    Input,
    Label
} from "components";
import i18next from "i18next";
import { AvField } from "availity-reactstrap-validation";
import classNames from "classnames";
import { CommonConfirmDialog } from "routes/components";
import { v4 as uuidv4 } from "uuid";
import { ErrorMessage } from "formik";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";

const ShortListSelectVendors = (props) => {
    const {
        isShow,
        showErrorCode,
        onHide,
        title,
        onPositiveAction,
        contentPositive,
        colorPositive,
        onNegativeAction,
        values,
        vendorList,
        setFieldValue,
        t
    } = props;

    const onChangeVendor = async (e, index) => {
        const { value } = e.target;
        setFieldValue(`listNonVendors[${index}].code`, value);
    };

    return (
        <CommonConfirmDialog
            isShow={isShow}
            onHide={onHide}
            title={title}
            positiveProps={
                {
                    onPositiveAction,
                    contentPositive,
                    colorPositive
                }
            }
            negativeProps={
                {
                    onNegativeAction
                }
            }
            size="md"
            centered
        // titleCenter
        >
            <Row>
                <Col>
                    <Row className="mb-3">
                        <Col>
                            <div>You are converting a request that consists of non-existing vendor.</div>
                            <div>In order to proceed, please perform the following vendor tagging:</div>
                        </Col>
                    </Row>
                    {values.listNonVendors?.map((item, index) => {
                        const invalid = isNullOrUndefinedOrEmpty(values.listNonVendors[index].code) && showErrorCode;
                        return (
                            <Row className="mb-3">
                                <Col xs={3}>
                                    <Label>{item.supplierCompanyName}</Label>
                                </Col>
                                <Col xs={9}>
                                    <div className="d-flex align-items-center">
                                        <select
                                            name="vendors"
                                            type="select"
                                            className={`${"form-control"}${invalid ? " is-invalid" : ""}`}
                                            onChange={(value) => onChangeVendor(value, index)}
                                            value={item.code}
                                        >
                                            <option on hidden value="">{t("PleaseSelectAVendor")}</option>
                                            {vendorList.map((option) => (
                                                <React.Fragment key={uuidv4()}>
                                                    <option key={uuidv4()} value={option.uuid}>
                                                        {`${option.companyName} (${option.companyCode})`}
                                                    </option>
                                                </React.Fragment>
                                            ))}
                                        </select>
                                        <ErrorMessage name="vendors" component="div" className="invalid-feedback" />
                                    </div>
                                </Col>
                            </Row>
                        );
                    })}
                </Col>
            </Row>
        </CommonConfirmDialog>
    );
};

ShortListSelectVendors.propTypes = {
    isShow: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    onPositiveAction: PropTypes.func.isRequired,
    contentPositive: PropTypes.string,
    colorPositive: PropTypes.string,
    onNegativeAction: PropTypes.func.isRequired
};
ShortListSelectVendors.defaultProps = {
    contentPositive: `${i18next.t("Add")}`,
    colorPositive: "primary"
};

export default ShortListSelectVendors;
