import { Formik } from "formik";
import { Container } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import PaymentCycleService from "services/PaymentCycleService";
import useToast from "routes/hooks/useToast";
import { useSelector } from "react-redux";
import { convertToLocalTime } from "helper/utilities";
import PaymentCycleForm from "../components/PaymentCycleForm";
import PAYMENT_CYCLE_FORM_INITIAL_VALUES from "../components/PaymentCycleFormInitialValues";
import PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA from "../components/PaymentCycleFormValidation";

const UpdatePaymentCycle = () => {
    const history = useHistory();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const showToast = useToast();
    const permissionReducer = useSelector((s) => s.permissionReducer);
    const [loading, setLoading] = useState(false);
    const [companyUuid, setCompanyUuid] = useState(null);
    const [initialValues, setInitialValues] = useState(PAYMENT_CYCLE_FORM_INITIAL_VALUES);
    const [readOnly, setReadOnly] = useState(true);

    const initData = async () => {
        setLoading(true);
        try {
            const { data } = await PaymentCycleService.getPaymentCycleDetails(companyUuid, query.get("uuid"));
            setInitialValues({
                ...data,
                createdOn: convertToLocalTime(data?.createdOn)
            });
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
        setLoading(false);
    };

    const onUpdate = async (data) => {
        setLoading(true);
        try {
            await PaymentCycleService.updatePaymentCycle(companyUuid, {
                uuid: query.get("uuid"),
                paymentCycleDate: Number(data.paymentCycleDate),
                description: data.description,
                active: data.active,
                supplierUuids: data?.paymentCycleSupplierList?.map((v) => v.uuid) || []
            });
            await initData();
            showToast("success", "Payment cycle successfully updated");
            setReadOnly(true);
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        setCompanyUuid(permissionReducer?.currentCompany?.companyUuid);
    }, [permissionReducer]);

    useEffect(() => {
        if (companyUuid) {
            initData();
        }
    }, [companyUuid]);

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                validationSchema={PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA}
                enableReinitialize
                onSubmit={onUpdate}
            >
                {(props) => (
                    <PaymentCycleForm
                        loading={loading}
                        formik={props}
                        companyUuid={companyUuid}
                        history={history}
                        isEdit
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                    />
                )}
            </Formik>
        </Container>
    );
};

export default UpdatePaymentCycle;
