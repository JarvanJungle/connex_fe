import PropTypes from "prop-types";

class DropdownProps {
    constructor(option = [], value = "", label = "", onChange = null, placeholder = "Select") {
        this.option = option;
        this.value = value;
        this.label = label;
        this.onChange = onChange;
        this.placeholder = placeholder;
    }
}

DropdownProps.propTypes = {
    option: PropTypes.instanceOf(Array),
    value: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string
};

export default DropdownProps;
