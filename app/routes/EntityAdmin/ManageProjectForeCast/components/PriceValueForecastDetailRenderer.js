import React from "react";
import { isNullOrUndefined } from "helper/utilities";

function PriceValueForecastDetailRenderer(params) {
    const { value } = params;

    const formatPrice = (number) => Number(number).toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        !isNullOrUndefined(value)
            ? (
                <span>{`${formatPrice(value)}`}</span>
            )
            : (
                <></>
            )
    );
}

export default PriceValueForecastDetailRenderer;
