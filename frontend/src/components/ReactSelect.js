import React, { useState } from 'react';
import Select from 'react-select';
import config from '../admin/components/Config';
import Cookies from 'js-cookie';

const ReactSelect = (props) => {
    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async (input) => {
        if (input.length > 1) {
            const response = await fetch(`${config.SERVER_URL}/api/tags?suggest=${input}`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get('jwt')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSuggestions(data.data?.map(tag => ({ label: tag.name, value: tag.slug })));
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleInputChange = (input) => {
        fetchSuggestions(input);
    };

    const handleChange = (selected) => {
        props.setSelectedTags(selected || []);
    };

    return (
        <Select
            isMulti={props.isMulti}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
            value={props.selectedTags}
            onInputChange={handleInputChange}
            onChange={handleChange}
            options={suggestions}
            placeholder={props.placeholder}
            className={props.className}
            isClearable={props.isClear ? props.isClear : false}
        />
    );
};

export default ReactSelect;
