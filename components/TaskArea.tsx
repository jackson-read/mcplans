"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toggleTask, deleteTask, updateTaskNote, reorderTasks, createTask } from "@/app/actions";
import SpinWheel from "./SpinWheel";

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    disabled: task.isCompleted 
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const isMyTask = task.creatorId === userId;
  const canDelete = isMyTask || isOwner;

return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`
        group ${theme.cardBg} border-2 p-3 backdrop-blur-sm transition-all flex flex-col gap-2 h-full touch-none
        ${!task.isCompleted ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        ${isDragging 
          ? 'border-white scale-105 rotate-2 z-50 shadow-2xl' 
          : `${theme.border} shadow-md hover:shadow-lg`       
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
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
         
         {canDelete && (
           <form action={deleteTask} onPointerDown={(e) => e.stopPropagation()}>
             <input type="hidden" name="taskId" value={task.id} />
             <input type="hidden" name="worldId" value={task.worldId} />
             <button type="submit" className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 transition-opacity text-xs font-bold cursor-pointer">
               X
             </button>
           </form>
         )}
      </div>

      <div className="flex-1">
        {/* NO MORE FAINT TEXT OR LINE-THROUGH */}
        <p className={`text-sm leading-tight ${theme.text}`}>{task.description}</p>
        <p className={`text-[9px] opacity-40 mt-1 font-mono uppercase ${theme.text}`}>By {userMap.get(task.creatorId || "")?.name || 'Unknown'}</p>
      </div>

<div className={`mt-auto pt-2 border-t ${theme.border} rounded p-1`}>
        {isMyTask ? (
          <form 
            onPointerDown={(e) => e.stopPropagation()} 
            action={updateTaskNote}
            className="w-full"
          >
             <input type="hidden" name="taskId" value={task.id} />
             <input type="hidden" name="worldId" value={task.worldId} />
             
             <textarea 
               name="note" 
               placeholder="Note..." 
               defaultValue={task.note || ""} 
               onKeyDown={(e) => { 
                 e.stopPropagation(); 
                 if(e.key === 'Enter') { 
                   e.preventDefault(); 
                   e.currentTarget.blur(); 
                 }
               }}
               onBlur={(e) => {
                 // Now that the form exists, this will actually grab the data and save it!
                 if (e.currentTarget.form) {
                   const fd = new FormData(e.currentTarget.form);
                   updateTaskNote(fd);
                 }
               }}
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
export default function TaskArea({ tasks, theme, userId, isOwner, userMap, worldId }: any) {
  const [items, setItems] = useState<Task[]>(tasks);
  const [isPending, startTransition] = useTransition();
  const isManuallyUpdating = useRef(false);

  useEffect(() => {
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

      isManuallyUpdating.current = true;
      setItems(newOrder);

      const targetWorldId = newOrder[0]?.worldId;
      if (targetWorldId) {
        const updates = newOrder.map((t: Task, index: number) => ({ id: t.id, position: index }));
        startTransition(async () => {
          await reorderTasks(updates, targetWorldId);
          setTimeout(() => { isManuallyUpdating.current = false; }, 2000); 
        });
      }
    }
  };

  const activeTasks = items.filter((t: any) => !t.isCompleted);
  const completedTasks = items.filter((t: any) => t.isCompleted);

return (
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"> 
      
      {isPending && (
        <div className={`absolute -top-14 right-0 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md z-50`}>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.text}`}>Syncing...</span>
        </div>
      )}

      {/* 🟢 LEFT COLUMN: Task History (Static) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h3 className={`font-minecraft text-xl border-b-2 ${theme.border} pb-2 ${theme.text} flex items-center gap-2`}>
          <span></span> Task History
        </h3>
        {completedTasks.length === 0 ? (
          <p className={`text-sm opacity-50 ${theme.text} font-minecraft`}>No tasks completed.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {completedTasks.map((task: any) => (
              <SortableTask key={task.id} task={task} theme={theme} userId={userId} userMap={userMap} isOwner={isOwner} />
            ))}
          </div>
        )}
      </div>

      {/* 🎡 MIDDLE COLUMN: Spin Wheel */}
      <div className="lg:col-span-1">
         <SpinWheel tasks={activeTasks} theme={theme} />
      </div>

      {/* 🔴 RIGHT COLUMNS: Create Form & Active Tasks */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* The Create Task Form */}
        <div className={`${theme.cardBg} border-4 ${theme.border} p-4 shadow-xl backdrop-blur-sm`}>
           <form action={createTask} className="flex gap-2">
              <input type="hidden" name="worldId" value={worldId} />
              <input name="description" required placeholder="Add a new task..." className={`flex-1 bg-black/20 border-2 ${theme.border} ${theme.text} rounded p-3 focus:outline-none focus:bg-black/40 transition-colors placeholder:text-white/30`} />
              <button className={`${theme.accent} ${theme.text} px-6 font-bold font-minecraft border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all`}>ADD</button>
           </form>
        </div>

        {/* The Draggable Grid */}
        <SortableContext items={activeTasks.map((t: any) => t.id)} strategy={rectSortingStrategy}>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${isPending ? 'opacity-80' : 'opacity-100'}`}>
            {activeTasks.map((task: any) => (
              <SortableTask key={task.id} task={task} theme={theme} userId={userId} userMap={userMap} isOwner={isOwner} />
            ))}
          </div>
        </SortableContext>

      </div>

    </div>
  </DndContext>
  );
}