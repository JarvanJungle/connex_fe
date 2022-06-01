import React from "react";

const Badge = ({ amount, bg, className }) => {
    let background = "";
    switch (bg) {
    case "danger":
        background = "#F88686";
        break;
    case "primary":
        background = "#AEC57D";
        break;
    case "secondary":
        background = "#868E96";
        break;
    default:
        break;
    }

    return (
        <div
            className={`badge-${bg} ${className}`}
            style={{
                borderRadius: "0.25rem",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "8px",
                background,
                lineHeight: "20px",
                height: "48px"
            }}
        >
            <div>{amount.text}</div>
            <div>{amount.formatNumber}</div>
        </div>
    );
};

export default Badge;
