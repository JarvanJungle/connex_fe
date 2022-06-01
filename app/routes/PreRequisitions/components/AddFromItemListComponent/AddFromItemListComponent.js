import React, { useRef } from "react";

import {
    Row,
    Col
} from "components";

import { Button } from "primereact/button";
import { formatDateTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    CatalogueItemListComponent
} from "./components";

import classes from "../PreRequisitionComponents.module.scss";
import selfStyle from "./AddFromItemListComponent.scss";

const AddFromItemListComponent = (props) => {
    const {
        t,
        rowData,
        onHide,
        setFieldValue,
        values
    } = props;

    const catalogueItemRef = useRef(null);

    const handleSelectedItem = () => {
        const selectedNodes = catalogueItemRef?.current?.api.getSelectedNodes();
        const selectedData = selectedNodes?.map((node) => node.data);
        selectedData.forEach((e) => {
            e.isEditable = true;
            e.itemCode = e.catalogueItemCode ? e.catalogueItemCode : undefined;
            e.itemName = e.catalogueItemName ? e.catalogueItemName : undefined;
            e.deliveryAddress = values.deliveryAddress ? values.deliveryAddress : undefined;
            e.requestDeliveryDate = values.deliveryDate
                ? formatDateTime(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD) : undefined;
            // set to fix BE error 500
            delete e.taxCode;
            delete e.taxRate;
            delete e.unitPrice;
            delete e.validFrom;
            delete e.validTo;
            delete e.catalogueItemCode;
            delete e.catalogueItemName;
        });
        setFieldValue("addingItemFromList", selectedData);
        onHide();
    };

    return (
        <Row id="addFromItemListComponent">
            <Col
                md={12}
                lg={12}
            >
                <Row className="py-3">
                    <Col
                        md={{ size: 4, offset: 4 }}
                        lg={{ size: 4, offset: 4 }}
                    >
                        <h2 className={selfStyle["h2-center"]}>
                            {t("Catalogue Items")}
                        </h2>
                    </Col>
                </Row>
                <CatalogueItemListComponent
                    rowData={rowData}
                    setFieldValue={setFieldValue}
                    gridRef={catalogueItemRef}
                />
                <Row className="py-3">
                    <Col
                        md={{ size: 4, offset: 8 }}
                        lg={{ size: 4, offset: 8 }}
                    >
                        <Row
                            className={classes["doxa-row-float-right"]}
                        >
                            <Button
                                className="doxa-button-close"
                                label={t("Close")}
                                onClick={() => onHide()}
                            />
                            <Button
                                className={classes["doxa-button-default"]}
                                label={t("Add Items")}
                                onClick={() => handleSelectedItem()}
                            />
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default AddFromItemListComponent;
