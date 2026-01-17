import React from 'react';
import { ActionIcon } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShelfControls = ({ onPrev, onNext, isLoading, itemCount }) => {
    const disabled = isLoading || itemCount < 2;

    return (
        <div className="shelf-controls">
            <ActionIcon onClick={onPrev} disabled={disabled}>
                <ChevronLeft />
            </ActionIcon>
            <ActionIcon onClick={onNext} disabled={disabled}>
                <ChevronRight />
            </ActionIcon>
        </div>
    );
};

export default ShelfControls;
