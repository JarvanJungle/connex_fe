import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { SelectInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import GR_CONSTANTS from "../constants/constants";

const GeneralInfor = (props) => {
    const {
        t,
        values,
        procurementTypes,
        handleChange,
        modeView
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="procurementType"
                            label={t("ProcurementType")}
                            placeholder={t("PleaseSelectProcurementType")}
                            options={procurementTypes}
                            optionLabel="label"
                            optionValue="value"
                            value={values.procurementType}
                            disabled={values.grType !== GR_CONSTANTS.NON_PO
                                || modeView.isViewDetailsMode}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInfor;
