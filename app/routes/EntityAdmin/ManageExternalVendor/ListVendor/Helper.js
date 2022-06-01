export const getListVendor = (data) => {
    if (!data) return [];
    const cpData = [...data];
    const result = cpData.map((item) => ({
        ...item,
        connected: item.connected ? "Connected" : "Disconnected",
        gstRegBusiness: item.gstRegBusiness === "Registered" ? "yes" : "no",
        systemStatus: item.systemStatus ? "active" : "inactive"
    }));

    return result;
};

/**
 * @param {Array} data The array data
 * @param {string} name The string
 * @returns {string}
 */
export const getFieldValue = (data, index, name, type) => {
    const row1 = data[0].data;
    const row2 = data[index].data;

    if (type) {
        const result = row1.indexOf(name.trim()) + type;
        return row2[result] !== "" ? row2[result] : "";
    }

    if (row1 && row1.length && row2 && row2.length && name) {
        const result = row1.indexOf(name.trim());
        return row2[result] !== "" ? row2[result] : "";
    }

    return "";
};
