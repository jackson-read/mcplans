'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTask } from './SortableTask';
import { completeTask } from '@/app/actions';

export default function TaskArea({ initialTasks, worldId }: { initialTasks: any[], worldId: number }) {
  const [items, setItems] = useState(initialTasks);

  useEffect(() => {
    setItems(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((task) => (
            <SortableTask key={task.id} id={task.id} description={task.description}>
              <div className="p-4 bg-white border rounded-lg flex justify-between items-center shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">⋮⋮</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">{task.description}</span>
                </div>
                
                <form action={completeTask}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="worldId" value={worldId} />
                  <button type="submit" className="w-6 h-6 border-2 border-zinc-300 rounded hover:bg-green-500 hover:border-green-500 transition-colors" />
                </form>
              </div>
            </SortableTask>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}