import React, {
    forwardRef, useImperativeHandle, useState, useEffect
} from "react";
import { Row } from "components";
import { roundNumberWithUpAndDown, formatDisplayDecimal } from "helper/utilities";
import { useTranslation } from "react-i18next";

const TotalRenderer = forwardRef((params, ref) => {
    const { t } = useTranslation();
    const { data, node } = params;
    const { column } = params;
    const { colId } = column;
    const index = colId.match(/\d/g);
    const [total, setTotal] = useState(0);
    const [subTotal, setSubTotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [sourceCurrency, setSourceCurrency] = useState(0);
    useImperativeHandle(ref, () => ({
        getReactContainerStyle() {
            if (node?.rowPinned === "bottom") {
                return {
                    width: "100%",
                    height: "100%",
                    justifyContent: "end",
                    display: "flex",
                    alignItems: "center",
                    textAlign: "right"
                };
            }
            return { textAlign: "left" };
        }
    }));

    useEffect(() => {
        if (data && node && colId) {
            if (node.rowPinned === "bottom") {
                setTotal(data[`supplier${index}`]?.total);
                setSubTotal(data[`supplier${index}`]?.subTotal);
                setTax(data[`supplier${index}`]?.tax);
                setSourceCurrency(data[`supplier${index}`]?.sourceCurrency);
            }
        }
    }, [data, node, colId]);

    return (
        <>
            {node.rowPinned === "bottom" && (
                <Row
                    className="mx-0 align-items-end flex-column text-secondary"
                    style={{
                        fontSize: "1rem",
                        fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
                        fontWeight: 400,
                        letterSpacing: "0.00938em"
                    }}
                >
                    <div style={{ textDecoration: "underline", lineHeight: "1.5" }}>
                        {t("InDocumentCurrency")}
                    </div>
                    <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                        <div style={{ width: "200px", lineHeight: "1.5" }}>
                            <div>{`${t("SubTotal")}:`}</div>
                            <div>{`${t("Tax")}:`}</div>
                            <div>{`${t("Total(include GST)")}:`}</div>
                        </div>
                        <div style={{ width: "100px", lineHeight: "1.5" }}>
                            <div>{sourceCurrency}</div>
                            <div>{sourceCurrency}</div>
                            <div>{sourceCurrency}</div>
                        </div>
                        <div style={{ marginLeft: "40px", lineHeight: "1.5" }}>
                            <div>{formatDisplayDecimal(roundNumberWithUpAndDown(subTotal), 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(roundNumberWithUpAndDown(tax), 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(roundNumberWithUpAndDown(total), 2) || "0.00"}</div>
                        </div>
                    </Row>
                </Row>
            )}
            {node.rowPinned !== "bottom" && (<>{data[`quotedCurrency${index}`]}</>)}
        </>
    );
});

export default TotalRenderer;
