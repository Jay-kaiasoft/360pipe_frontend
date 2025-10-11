import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

const SortableList = () => {
    const [items, setItems] = useState([
        { id: 1, name: '🍎 Apple' },
        { id: 2, name: '🍌 Banana' },
        { id: 3, name: '🍇 Grape' },
        { id: 4, name: '🍊 Orange' },
    ]);

    const handleSet = (newState) => {
        console.log('New order:', newState);
        setItems(newState);
    }

    return (
        <div className="max-w-sm mx-auto mt-10">
            <h2 className="text-lg font-semibold mb-3 text-center">Drag to Reorder Fruits 🍉</h2>

            <ReactSortable
                list={items}
                setList={handleSet}
                animation={200}
                ghostClass="opacity-50"
                className="flex flex-col gap-2"
            >
                {items?.map(item => (
                    <div
                        key={item.id}
                        className="p-3 border rounded-lg bg-white shadow hover:bg-gray-50 cursor-move transition"
                    >
                        {item.name}
                    </div>
                ))}
            </ReactSortable>

            <div className="mt-4 text-sm text-gray-500">
                Current order: {items.map(i => i.name).join(', ')}
            </div>
        </div>
    );
};

export default SortableList;
