import { useState } from "react";
import { convertToLocalTime } from "helper/utilities";

export default function useAuditTrail(defaultValue) {
    const [rowDataAuditTrail, setRowDataAuditTrail] = useState(defaultValue);

    const setNewRowDataAuditTrail = (auditTrails, convertActionFunc = null) => {
        if (auditTrails && Array.isArray(auditTrails)) {
            const newRowAuditTrail = auditTrails.map(
                ({
                    date, dateTime, userRole, role, action, ...rest
                }) => ({
                    ...rest,
                    date: convertToLocalTime(dateTime || date || ""),
                    role: userRole || role,
                    action: convertActionFunc ? convertActionFunc(action) : action
                })
            );
            setRowDataAuditTrail(newRowAuditTrail);
        }
    };

    return [rowDataAuditTrail, setNewRowDataAuditTrail];
}
