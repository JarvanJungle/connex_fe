import React from "react";

function PriceValueSummaryRenderer(params) {
    const { value, data } = params;

    const formatPrice = (number) => Number(number).toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        value
            ? (
                <span>{`${data.currency} ${formatPrice(value)}`}</span>
            )
            : (
                <span>{`${data.currency} ${formatPrice(0)}`}</span>
            )
    );
}

export default PriceValueSummaryRenderer;
