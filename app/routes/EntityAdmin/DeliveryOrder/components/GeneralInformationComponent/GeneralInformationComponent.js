import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    SelectInput
} from "components";

const GeneralInformationComponent = (props) => {
    const {
        t, errors,
        touched,
        procurementTypes,
        handleChange,
        values
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
                            onChange={handleChange}
                            value={values.procurementType}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformationComponent;
