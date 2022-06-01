import React, {
    forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState
} from "react";
import CreatableSelect from "react-select/creatable";

const AgDropdownInput = forwardRef(({ value, values, getOption }, ref) => {
    const [selected, setSelected] = useState();
    const selectedRef = useRef();
    const options = useMemo(() => (values || []).map(getOption), [values]);
    useEffect(() => setSelected(
        typeof value === "string" ? options?.find((o) => o.value === value) : getOption(value ?? { })
    ), [value]);

    useImperativeHandle(ref, () => ({
        getValue: () => (selected ? { priceType: selected?.value } : null),
        isPopup: () => true
    }));

    const handleChange = (
        newValue,
        actionMeta
    ) => {
        console.group("Value Changed");
        console.log("newValue", newValue);
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();
        setSelected(newValue);
    };
    const handleInputChange = (inputValue, actionMeta) => {
        console.group("Input Changed");
        console.log(inputValue);
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();
    };

    return (
        <div style={{ width: 200 }}>
            {/* <Select
                ref={selectedRef}
                value={selected}
                onChange={setSelected}
                options={options}
                isSearchable
                isClearable
            /> */}
            <CreatableSelect
                ref={selectedRef}
                isClearable
                onChange={handleChange}
                onInputChange={handleInputChange}
                options={options}
                value={selected}
            />
        </div>
    );
});

export default AgDropdownInput;
