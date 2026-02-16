"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toggleTask, deleteTask, updateTaskNote, reorderTasks } from "@/app/actions";

interface Task {
  id: number;
  worldId: number;
  description: string;
  isCompleted: boolean;
  creatorId: string;
  note?: string;
  position: number;
}

// --- 1. THE DRAGGABLE CARD COMPONENT ---
function SortableTask({ task, theme, userId, isOwner, userMap }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const isMyTask = task.creatorId === userId;
  const canDelete = isMyTask || isOwner; // Owners can delete anything

  // Helper to handle delete
  const handleDelete = () => {
    const formData = new FormData();
    formData.append("taskId", task.id);
    formData.append("worldId", task.worldId);
    deleteTask(formData);
  };

return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`
        group ${theme.cardBg} border-2 p-3 backdrop-blur-sm transition-all flex flex-col gap-2 h-full touch-none cursor-grab active:cursor-grabbing
        ${isDragging 
          ? 'border-white scale-105 rotate-2 z-50 shadow-2xl' // 🚀 The "Dragged" Look
          : `${theme.border} shadow-md hover:shadow-lg`       // 😴 The "Idle" Look
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
         {/* Checkbox (Stop Propagation so we don't drag) */}
         <button 
           onPointerDown={(e) => e.stopPropagation()} 
           onClick={() => {
              const formData = new FormData();
              formData.append("taskId", task.id);
              formData.append("worldId", task.worldId);
              toggleTask(formData);
           }}
           className={`w-5 h-5 border-2 ${theme.border} bg-black/20 flex items-center justify-center hover:bg-white/10 text-white transition-colors rounded-sm cursor-pointer`}
         >
            {task.isCompleted && <span className="text-sm leading-none">✓</span>}
         </button>
         
         {/* Delete (Only show if allowed) */}
         {canDelete && (
           <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 transition-opacity text-xs font-bold cursor-pointer"
           >X</button>
         )}
      </div>

      <div className="flex-1">
        <p className={`text-sm leading-tight ${theme.text} ${task.isCompleted ? "line-through opacity-40" : ""}`}>{task.description}</p>
        <p className={`text-[9px] opacity-40 mt-1 font-mono uppercase ${theme.text}`}>By {userMap.get(task.creatorId || "")?.name || 'Unknown'}</p>
      </div>

      <div className={`mt-auto pt-2 border-t ${theme.border} rounded p-1`}>
        {isMyTask ? (
          <form 
            onPointerDown={(e) => e.stopPropagation()} 
            action={updateTaskNote}
          >
             <input type="hidden" name="taskId" value={task.id} />
             <input type="hidden" name="worldId" value={task.worldId} />
             <textarea 
               name="note" 
               placeholder="Note..." 
               defaultValue={task.note || ""} 
               onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); e.currentTarget.form?.requestSubmit(); }}}
               className={`w-full bg-transparent text-xs ${theme.text} opacity-80 focus:opacity-100 focus:outline-none resize-none h-6 focus:h-12 transition-all placeholder:text-white/20`} 
             />
          </form>
        ) : (
          task.note ? <p className={`text-xs opacity-70 italic ${theme.text}`}>"{task.note}"</p> : <p className={`text-[9px] opacity-20 italic ${theme.text}`}>No notes.</p>
        )}
      </div>
    </div>
  );
}

// --- 2. THE MAIN AREA ---
export default function TaskArea({ tasks, theme, userId, isOwner, userMap }: any) {
  const [items, setItems] = useState<Task[]>(tasks);
  const [isPending, startTransition] = useTransition();
  const isManuallyUpdating = useRef(false);

  // Sync with DB updates
useEffect(() => {
    // Only overwrite our local items if:
    // 1. We aren't in the middle of a save (isPending)
    // 2. We haven't just finished a drag (isManuallyUpdating)
    // 3. OR the number of tasks actually changed (Add/Delete)
    if ((!isPending && !isManuallyUpdating.current) || tasks.length !== items.length) {
      setItems(tasks);
    }
  }, [tasks, isPending]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i: any) => i.id === active.id);
      const newIndex = items.findIndex((i: any) => i.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex) as Task[];

      // 1. Activate the Lock
      isManuallyUpdating.current = true;
      setItems(newOrder);

      const worldId = newOrder[0]?.worldId;
      if (worldId) {
        const updates = newOrder.map((t: Task, index: number) => ({ 
          id: t.id, 
          position: index 
        }));

        startTransition(async () => {
          await reorderTasks(updates, worldId);
          
          // 2. Release the lock after a short delay to let the cache settle
          setTimeout(() => {
            isManuallyUpdating.current = false;
          }, 2000); 
        });
      }
    }
  };

return (
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <div className="relative"> {/* Added relative wrapper */}
      
      {/* 🟢 SAVING INDICATOR */}
      {isPending && (
        <div className={`absolute -top-10 right-0 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md z-50`}>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.text}`}>Syncing with World...</span>
        </div>
      )}

      <SortableContext items={items.map((t: any) => t.id)} strategy={rectSortingStrategy}>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-500 ${isPending ? 'opacity-80' : 'opacity-100'}`}>
          {items.map((task: any) => (
            <SortableTask 
              key={task.id} 
              task={task} 
              theme={theme} 
              userId={userId} 
              userMap={userMap} 
            />
          ))}
        </div>
      </SortableContext>
    </div>
  </DndContext>
  );
}