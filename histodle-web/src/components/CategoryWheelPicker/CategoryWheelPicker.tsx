
import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Category } from '../../types/category';
import './CategoryWheelPicker.css';

const ITEM_WIDTH = 180;

interface CategoryWheelPickerProps {
    categories: Category[];
    selectedCategoryId: string;
    onCategoryChange: (id: string) => void;
    disabled?: boolean;
}

export const CategoryWheelPicker: React.FC<CategoryWheelPickerProps> = ({
    categories,
    selectedCategoryId,
    onCategoryChange,
    disabled = false,
}) => {
    const allOptions = [
        { id: 'all', name: 'Todas las categorías' },
        ...categories
    ];

    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const isProgrammaticScroll = useRef(false);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getCurrentIndex = useCallback(() => {
        const index = allOptions.findIndex(
            (category) => String(category.id) === String(selectedCategoryId)
        );

        return index !== -1 ? index : 0;
    }, [allOptions, selectedCategoryId]);

    const [selectedIndex, setSelectedIndex] = useState(getCurrentIndex);

    // Centra un elemento dentro del carrusel.
    const centerItem = useCallback((index: number, behavior: ScrollBehavior) => {
        const container = containerRef.current;
        const item = itemRefs.current[index];

        if (!container || !item) return;

        const containerCenter = container.clientWidth / 2;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;

        container.scrollTo({
            left: itemCenter - containerCenter,
            behavior,
        });
    }, []);

    // Sincroniza el índice con la categoría seleccionada externamente.
    useEffect(() => {
        const index = getCurrentIndex();

        setSelectedIndex(index);

        const frame = requestAnimationFrame(() => {
            centerItem(index, 'auto');
        });

        return () => cancelAnimationFrame(frame);
    }, [getCurrentIndex, centerItem]);

    // Limpia el temporizador si el componente se desmonta.
    useEffect(() => {
        return () => {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, []);

    // Detecta el elemento más cercano al centro durante el scroll manual.
    const handleScroll = () => {
        const container = containerRef.current;

        if (!container || disabled) return;

        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
            const containerCenter =
                container.scrollLeft + container.clientWidth / 2;

            let closestIndex = 0;
            let closestDistance = Infinity;

            itemRefs.current.forEach((item, index) => {
                if (!item) return;

                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distance = Math.abs(itemCenter - containerCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            setSelectedIndex((previousIndex) => {
                if (previousIndex !== closestIndex) {
                    onCategoryChange(String(allOptions[closestIndex].id));
                }

                return closestIndex;
            });
        }, 80);
    };

    // Selección mediante clic.
    const handleItemClick = (index: number, id: string) => {
        if (disabled) return;

        setSelectedIndex(index);
        onCategoryChange(id);
        centerItem(index, 'smooth');
    };

    return (
        <div
            className={`category-wheel-wrapper ${
                disabled ? 'disabled' : ''
            }`}
        >
            <div className="category-wheel-overlay" />

            <div
                ref={containerRef}
                className="category-wheel-container"
                onScroll={handleScroll}
            >
                {allOptions.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    const isNeighbor =
                        Math.abs(index - selectedIndex) === 1;

                    return (
                        <button
                            key={item.id}
                            ref={(element) => {
                                itemRefs.current[index] = element;
                            }}
                            type="button"
                            className={`category-wheel-item ${
                                isSelected
                                    ? 'selected'
                                    : isNeighbor
                                    ? 'neighbor'
                                    : 'far'
                            }`}
                            onClick={() =>
                                handleItemClick(index, String(item.id))
                            }
                            disabled={disabled}
                            aria-pressed={isSelected}
                        >
                            {item.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
