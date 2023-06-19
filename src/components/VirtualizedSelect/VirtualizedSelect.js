import React from 'react';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';
import { debounce } from 'lodash';

const height = 35;

const Option = props => {
    const { innerProps, label } = props;

    return (
        <div {...innerProps} style={{ lineHeight: '25px', fontSize: '12px' }}>
            {label}
        </div>
    );
};

const MenuList = (props) => {
    const { options, children, getValue } = props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
        <List
            height={Math.min(4, children.length) * height}  // Limit the maximum height to 4 visible items.
            itemCount={children.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
        >
            {({ index, style }) => <div style={style}>{children[index]}</div>}
        </List>
    );
};

export default function VirtualizedSelect(props) {
    // Defer execution of the onChange handler by 200ms
    const debouncedOnChange = debounce(props.onChange, 200);

    return (
        <Select
            {...props}
            onChange={debouncedOnChange}
            components={{
                MenuList,
                Option,
            }}
        />
    );
}
