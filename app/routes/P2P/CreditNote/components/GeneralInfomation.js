import React from "react";
import {
    Card, CardBody, CardHeader, HorizontalInput, SelectInput
} from "components";

const GeneralInformation = ({
    t, errors, touched, approvalRoutes, setFieldValue, values, disabled
}) => (
    <Card className="mb-4">
        <CardHeader tag="h6">
            {t("GeneralInformation")}
        </CardHeader>
        <CardBody>

            <SelectInput
                name="approvalRouteUuid"
                label={t("ApprovalRoute")}
                className="label-required"
                placeholder={t("PleaseSelectApprovalRoute")}
                errors={errors.approvalRouteUuid}
                touched={touched.approvalRouteUuid}
                options={approvalRoutes}
                optionLabel="approvalName"
                optionValue="uuid"
                onChange={(e) => setFieldValue("approvalRouteUuid", e.target.value)}
                value={values.approvalRouteUuid}
                disabled={disabled}
            />

            <HorizontalInput
                name="approvalSequence"
                label={t("ApprovalSequence")}
                type="text"
                placeholder=""
                errors={errors.approvalSequence}
                touched={touched.approvalSequence}
                disabled
                value={values.approvalSequence}
            />

        </CardBody>
    </Card>
);

export default GeneralInformation;
