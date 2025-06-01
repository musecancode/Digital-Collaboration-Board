"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronLeft, GripVertical, Pencil } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import ConfirmDialog from "./confirm-dialog"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"

function BoardPreview({ board }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const pinnedPosts = board.posts.filter(p => p.isPinned)

  const handleDotClick = (index) => {
    setCurrentIndex(index)
  }

  if (pinnedPosts.length === 0) {
    return (
      <div className="h-32 bg-white/50 backdrop-blur-sm rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">
          {board.posts.length} {board.posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
    )
  }

  const currentPost = pinnedPosts[currentIndex]

  return (
    <div className="h-32 bg-white/50 backdrop-blur-sm rounded-md relative overflow-hidden group">
      {currentPost.imageUrl ? (
        <img 
          src={currentPost.imageUrl} 
          alt={currentPost.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
          <p className="text-sm text-center line-clamp-3">{currentPost.title}</p>
        </div>
      )}
      
      {pinnedPosts.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {pinnedPosts.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleDotClick(index)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SortableBoard({ board, onSelectBoard, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: board.id })

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
  } : undefined

  const handleClick = (e) => {
    if (e.target.closest('button')) {
      return; 
    }
    onSelectBoard(board);
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card 
        className={`overflow-hidden ${board.color || "bg-white"} cursor-pointer group hover:shadow-lg transition-all h-full relative`}
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center gap-2">
            <CardTitle className={`text-xl ${board.textColor || ""} truncate`}>
              {board.title}
            </CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(board);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(board);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="mt-2">{board.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <BoardPreview board={board} />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <span>Created {formatDistanceToNow(new Date(board.createdAt))} ago</span>
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function BoardList({ boards, onSelectBoard, onDeleteBoard, onReorderBoards, onEditBoard }) {
  const [boardToDelete, setBoardToDelete] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = boards.findIndex((board) => board.id === active.id)
      const newIndex = boards.findIndex((board) => board.id === over.id)
      const reorderedBoards = arrayMove(boards, oldIndex, newIndex)
      onReorderBoards(reorderedBoards)
    }
  }

  if (boards.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg">
        <h3 className="text-xl font-medium mb-2">No boards found</h3>
        <p className="text-muted-foreground">Create your first board to get started!</p>
      </div>
    )
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={boards.map(board => board.id)} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {boards.map((board) => (
              <SortableBoard
                key={board.id}
                board={board}
                onSelectBoard={onSelectBoard}
                onDelete={() => setBoardToDelete(board)}
                onEdit={onEditBoard}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        isOpen={!!boardToDelete}
        onClose={() => setBoardToDelete(null)}
        onConfirm={() => {
          if (boardToDelete) {
            onDeleteBoard(boardToDelete.id)
          }
        }}
        title="Delete Board"
        message="Are you sure you want to delete this board? All posts within this board will be permanently deleted. This action cannot be undone."
      />
    </>
  )
}
