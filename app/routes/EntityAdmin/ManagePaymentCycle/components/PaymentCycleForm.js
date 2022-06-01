import React, {
    useEffect, useRef, useState
} from "react";
import {
    Row, Col, Card, CardHeader, Button
} from "components";
import { HorizontalInput } from "components";
import { useTranslation } from "react-i18next";
import { CardBody, Label } from "reactstrap";
import { AddItemDialog, AuditTrail } from "routes/components";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import useToast from "routes/hooks/useToast";
import { SelectInput } from "routes/P2P/PurchaseRequest/components";
import PropTypes from "prop-types";
import { Form } from "formik";
import SupplierService from "services/SupplierService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ActionModal from "routes/components/ActionModal";
import { HeaderMain } from "routes/components/HeaderMain";
import { Checkbox } from "primereact/checkbox";
import { convertToLocalTime } from "helper/utilities";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { ExternalVendorTagging } from "../../ManageAPSpecialist/components";
import { AddVendorColDefs } from "../../ManageAPSpecialist/ColumnDefs";

const PaymentCycleForm = (props) => {
    const {
        formik, isEdit, readOnly, setReadOnly, history, loading, companyUuid
    } = props;
    const {
        errors, touched, values, setFieldValue, dirty, handleSubmit, submitForm
    } = formik;
    const { t } = useTranslation();
    const showToast = useToast();
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const refActionModal = useRef(null);
    const [showAddVendor, setShowAddVendor] = useState(false);
    const [listVendors, setListVendors] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const paymentCyclePermission = usePermission(FEATURE.PAYMENT_CYCLE);

    const PAYMENT_CYCLE_DATE_OPTIONS = Array.from(Array(31).keys()).map((val) => ({
        label: val + 1,
        value: val + 1
    }));

    const getListVendors = () => {
        SupplierService.retrieveAllSuppliersUnderCompany(companyUuid)
            .then((res) => setListVendors(res?.data?.data))
            .catch(console.error);
    };

    const onOpenAddVendorModal = () => {
        setListVendors(listVendors?.map((vendor) => ({
            ...vendor,
            isSelected: !!values?.paymentCycleSupplierList?.find((v) => v.uuid === vendor.uuid)
        })));
        setShowAddVendor(true);
    };

    const onAddVendors = () => {
        setDirty();
        setFieldValue("paymentCycleSupplierList", [
            ...values?.paymentCycleSupplierList,
            ...selectedVendors
        ]);
        console.log(selectedVendors.filter(
            (selectedVendor) => !values?.paymentCycleSupplierList.some(
                (valuesVendor) => selectedVendor.uuid === valuesVendor.uuid
            )
        ));
        setShowAddVendor(false);
    };

    const onDeleteVendor = (uuid, rowData) => {
        setDirty();
        setFieldValue("paymentCycleSupplierList", rowData.filter((v) => v.uuid !== uuid));
    };

    useEffect(() => {
        if (companyUuid) getListVendors();
    }, [companyUuid]);

    useEffect(() => {
        if (dirty) {
            setDirty();
        }
    }, values);

    return (
        <Form onSubmit={handleSubmit}>
            <Row className="mb-5">
                <Col lg={12}>
                    <HeaderMain
                        title={isEdit ? t("PaymentCycleDetails") : t("CreateNewPaymentCycle")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
                <Col xs={6}>
                    <Card>
                        <CardHeader>
                            {t("PaymentCycleDetails")}
                        </CardHeader>
                        <CardBody>
                            <HorizontalInput
                                name="paymentCycleCode"
                                label={t("PaymentCycleCode")}
                                className="label-required"
                                type="text"
                                value={values.paymentCycleCode}
                                errors={errors.paymentCycleCode}
                                touched={touched.paymentCycleCode}
                                disabled={readOnly || isEdit}
                                maxLength={50}
                            />
                            <SelectInput
                                name="paymentCycleDate"
                                label={t("PaymentCycleDate")}
                                className="label-required"
                                placeholder={t("PleaseSelectPaymentCycleDate")}
                                errors={errors.paymentCycleDate}
                                touched={touched.paymentCycleDate}
                                options={PAYMENT_CYCLE_DATE_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => setFieldValue("paymentCycleDate", e.target.value)}
                                value={values?.paymentCycleDate}
                                disabled={readOnly}
                            />
                            <HorizontalInput
                                name="description"
                                label={t("Description")}
                                type="textarea"
                                maxLength={500}
                                errors={errors.description}
                                touched={touched.description}
                                disabled={readOnly}
                            />
                            <Row className="form-group">
                                <Col md={4}>
                                    <Label className="p-0">{t("SetActiveStatus")}</Label>
                                </Col>
                                <Col md={8}>
                                    <div className="p-field-checkbox">
                                        <Checkbox
                                            checked={values?.active}
                                            onChange={() => setFieldValue("active", !values?.active)}
                                            disabled={readOnly}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            {isEdit && (
                                <>
                                    <HorizontalInput
                                        name="createdBy"
                                        label={t("CreatedBy")}
                                        type="text"
                                        value={values.createdByName}
                                        disabled={readOnly || isEdit}
                                    />
                                    <HorizontalInput
                                        name="createdOn"
                                        label={t("CreatedOn")}
                                        type="text"
                                        value={values.createdOn}
                                        disabled={readOnly || isEdit}
                                    />
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Col>
                <Col xs={12} className="mt-3">
                    <ExternalVendorTagging
                        values={{
                            vendorUuid: values?.paymentCycleSupplierList?.map(
                                ({ uuid }) => listVendors.find((v) => v.uuid === uuid)
                            ) || []
                        }}
                        gridHeight={350}
                        addVendor={onOpenAddVendorModal}
                        onDeleteItem={onDeleteVendor}
                        header="Vendor"
                        disabled={readOnly}
                    />
                </Col>
                <Col xs={12}>
                    <AuditTrail
                        rowData={values?.paymentCycleAuditTrail?.map((at) => ({
                            ...at,
                            dateTime: convertToLocalTime(at.dateTime)
                        })) || []}
                        onGridReady={({ api }) => api.sizeColumnsToFit()}
                        paginationPageSize={10}
                        gridHeight={350}
                        defaultExpanded
                    />
                </Col>
            </Row>
            {/* Footer */}
            <StickyFooter>
                <Row className="mx-0 px-3 justify-content-between">
                    <Button
                        color="secondary"
                        onClick={() => history.goBack()}
                    >
                        {t("Back")}
                    </Button>

                    <div className="mx-0">
                        {paymentCyclePermission.write && (
                            readOnly
                                ? (
                                    <Button
                                        color="secondary"
                                        type="button"
                                        className="btn-facebook"
                                        onClick={() => setReadOnly(false)}
                                        disabled={loading}
                                    >
                                        {`${t("Edit")} `}
                                        <i className="fa fa-pencil ml-1" />
                                    </Button>
                                )
                                : (
                                    <>
                                        <Button
                                            color="primary"
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    !formik.dirty
                                                && Object.keys(formik.errors).length
                                                ) {
                                                    showToast("error", "Validation error, please check your input.");
                                                } else {
                                                    refActionModal?.current?.toggleModal();
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            {t(isEdit ? "Save" : "Create")}
                                        </Button>
                                    </>

                                ))}
                    </div>
                </Row>
            </StickyFooter>
            <AddItemDialog
                isShow={showAddVendor}
                onHide={() => {
                    setShowAddVendor(false);
                }}
                title={t("AddVendor")}
                onPositiveAction={onAddVendors}
                onNegativeAction={() => {
                    setShowAddVendor(false);
                }}
                columnDefs={AddVendorColDefs}
                rowDataItem={listVendors?.filter((v) => v.connectionStatus === "CONNECTED")}
                onSelectionChanged={({ api }) => {
                    setSelectedVendors(api.getSelectedNodes().map((node) => node.data));
                }}
            />
            <ActionModal
                ref={refActionModal}
                title={`Do you wish to ${isEdit ? "update" : "create"} this record?`}
                body={`Do you wish to ${isEdit ? "update" : "create"} this record?`}
                button="Yes"
                color="primary"
                action={() => setPristine() || submitForm()}
            />
            {Prompt}
        </Form>
    );
};

PaymentCycleForm.propTypes = {
    loading: PropTypes.bool.isRequired,
    companyUuid: PropTypes.string
};

PaymentCycleForm.defaultProps = {
    companyUuid: null
};

export default PaymentCycleForm;
