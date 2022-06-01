import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { SelectInput } from "routes/PreRequisitions/RaisePreRequisitions/components";

const GoodsReceiptDetails = (props) => {
    const {
        t,
        options,
        handleChange,
        values,
        touched,
        errors
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
                            name="grType"
                            label={t("GoodsReceiptType")}
                            placeholder={t("PleaseSelectGoodsReceiptType")}
                            errors={errors.grType}
                            touched={touched.grType}
                            options={options}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.grType}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GoodsReceiptDetails;
