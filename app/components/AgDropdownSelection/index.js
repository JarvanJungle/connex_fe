import React, {
    forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState
} from "react";
import Select from "react-select";

const AgDropdownSelection = forwardRef(({ value, values, getOption }, ref) => {
    const [selected, setSelected] = useState();
    const selectedRef = useRef();
    const options = useMemo(() => (values || []).map(getOption), [values]);
    useEffect(() => setSelected(
        typeof value === "string" ? options?.find((o) => o.value === value) : getOption(value ?? {})
    ), [value]);

    useImperativeHandle(ref, () => ({
        getValue: () => values?.find((e) => getOption(e ?? {})?.value === selected?.value),
        isPopup: () => true
    }));

    return (
        <div style={{ width: 200 }}>
            <Select
                ref={selectedRef}
                value={selected}
                onChange={setSelected}
                options={options}
                isSearchable
                isClearable
            />
        </div>

    );
});

export default AgDropdownSelection;
