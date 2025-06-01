"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Heart, Bookmark, MoreVertical, ArrowLeft, Plus, GripVertical } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ImageUpload from "./image-upload"
import ConfirmDialog from "./confirm-dialog"
import Notification from "./notification"

export default function BoardView({
  board,
  onUpdateBoard,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onLikePost,
  onBookmarkPost,
  onReorderPosts,
  onBackToWall,
}) {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [searchPostQuery, setSearchPostQuery] = useState("")
  const [showBookmarked, setShowBookmarked] = useState(false)
  const [notification, setNotification] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredPosts = board.posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchPostQuery.toLowerCase()) || 
                           post.content.toLowerCase().includes(searchPostQuery.toLowerCase())
      if (showBookmarked) {
        return matchesSearch && post.isBookmarked
      }
      return matchesSearch
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

  const handleCreateNewPost = (newPost) => {
    if (newPost.title.length > 26) {
      newPost.title = newPost.title.slice(0, 26);
    }
    onCreatePost(newPost);
    setNotification("New post created");
  };

  const handleUpdatePost = (updatedPost) => {
    if (updatedPost.title.length > 26) {
      updatedPost.title = updatedPost.title.slice(0, 26);
    }
    onUpdatePost(updatedPost);
    setNotification("Post updated");
  };

  const handlePinPost = (postId) => {
    const pinnedPosts = board.posts.filter(p => p.isPinned).length;
    const post = board.posts.find(p => p.id === postId);
    
    if (!post.isPinned && pinnedPosts >= 2) {
      setNotification("You can only pin up to 2 posts");
      return;
    }

    const updatedPost = { ...post, isPinned: !post.isPinned };
    onUpdatePost(updatedPost);
    setNotification(updatedPost.isPinned ? "Post pinned to top" : "Post unpinned");
  }

  const animateLayoutChanges = (args) => {
    const { transform } = args;
    return {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition: transform ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)' : undefined,
    };
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = board.posts.findIndex((post) => post.id === active.id);
      const newIndex = board.posts.findIndex((post) => post.id === over.id);
      

      const targetPost = board.posts[newIndex];
      if (targetPost.isPinned) return;

      const reorderedPosts = arrayMove(board.posts, oldIndex, newIndex);
      onReorderPosts(reorderedPosts);
    }
  };

  return (
    <div className={`min-h-screen ${board.color || "bg-sky-50"}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBackToWall} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">{board.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8 w-48"
              value={searchPostQuery}
              onChange={(e) => setSearchPostQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full ${showBookmarked ? "bg-gray-100" : ""}`}
            onClick={() => setShowBookmarked(!showBookmarked)}
          >
            <Bookmark 
              className="h-5 w-5" 
              fill={showBookmarked ? "currentColor" : "none"}
            />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6">
        {/* Create post button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new post
          </Button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-white">
            <h3 className="text-xl font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {showBookmarked ? "You haven't bookmarked any posts yet." : "Create your first post to get started!"}
            </p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
            animateLayoutChanges={animateLayoutChanges}
          >
            <SortableContext items={filteredPosts.map((post) => post.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                {filteredPosts.map((post) => (
                  <SortablePostItem
                    key={post.id}
                    post={post}
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => {
                      onDeletePost(post.id);
                      setNotification("Post deleted");
                    }}
                    onLike={() => {
                      onLikePost(post.id)
                      setNotification(post.isLiked ? "Post unliked" : "Post liked")
                    }}
                    onBookmark={() => {
                      onBookmarkPost(post.id)
                      setNotification(post.isBookmarked ? "Post removed from bookmarks" : "Post bookmarked")
                    }}
                    onPin={() => handlePinPost(post.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onCreatePost={handleCreateNewPost}
      />

      <EditPostModal
        isOpen={!!editingPost}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onUpdatePost={(updatedPost) => {
          handleUpdatePost(updatedPost);
          setEditingPost(null);
        }}
      />

      {notification && (
        <Notification 
          message={notification} 
          onClose={() => setNotification("")} 
        />
      )}
    </div>
  )
}

function SortablePostItem({ post, onEdit, onDelete, onLike, onBookmark, onPin }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: post.id,
    disabled: post.isPinned,
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
  } : undefined

  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <div ref={setNodeRef} style={style} className="relative h-full">
        <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col group ${
          post.isPinned ? 'border-2 border-sky-200' : ''
        }`}>
          <div className="p-4 flex-1">
            <div className="flex justify-between items-center gap-2 mb-1">
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold leading-tight">
                    {post.title.length > 26 
                      ? post.title.split(' ').reduce((lines, word) => {
                          const currentLine = lines[lines.length - 1];
                          if (!currentLine || (currentLine + ' ' + word).length > 26) {
                            lines.push(word);
                          } else {
                            lines[lines.length - 1] = currentLine + ' ' + word;
                          }
                          return lines;
                        }, []).map((line, i) => (
                          <span key={i} className="block">{line}</span>
                        ))
                      : post.title
                    }
                  </h3>
                  {post.isPinned && (
                    <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      Pinned
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => handleAction(e, onBookmark)}
                  className="h-7 w-7 p-0"
                >
                  <Bookmark className="h-4 w-4" fill={post.isBookmarked ? "currentColor" : "none"} />
                </Button>
                <div className="menu-container relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 p-0" 
                    onClick={(e) => handleAction(e, () => setShowMenu(!showMenu))}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {showMenu && (
                    <div 
                      className="absolute right-0 mt-1 w-36 bg-white shadow-md rounded-md z-30 py-1"
                    >
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={(e) => handleAction(e, () => {
                          onPin();
                          setShowMenu(false);
                        })}
                      >
                        {post.isPinned ? 'Unpin' : 'Pin to Top'}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={(e) => handleAction(e, () => {
                          onEdit();
                          setShowMenu(false);
                        })}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        onClick={(e) => handleAction(e, () => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        })}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">{formatDate(new Date(post.createdAt))}</p>

            {/* Image section - fixed aspect ratio */}
            {post.imageUrl && (
              <div className="mb-4 relative aspect-video">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
            
            {/* Content section with max height and scroll */}
            <div className="max-h-[200px] overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>
          </div>

          {/* Footer */}
          <CardFooter className="px-4 py-3 border-t mt-auto flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAction(e, onLike)}
              className={`p-0 h-auto flex items-center gap-1 z-20 ${
                post.isLiked ? "text-red-500" : "text-gray-500"
              }`}
            >
              <Heart className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} />
              <span className="text-xs">{post.likes}</span>
            </Button>
            {!post.isPinned && (
              <div
                {...attributes}
                {...listeners}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </>
  )
}

function CreatePostModal({ isOpen, onClose, onCreatePost }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreatePost({ title, content, imageUrl })
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setImageUrl("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 26))}
                placeholder="Enter post title (max 26 characters)"
                maxLength={26}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content"
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Create Post</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditPostModal({ isOpen, post, onClose, onUpdatePost }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setImageUrl(post.imageUrl || "")
    }
  }, [post])

  if (!post) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdatePost({
      ...post,
      title,
      content,
      imageUrl,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 26))}
                placeholder="Enter post title (max 26 characters)"
                maxLength={26}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content"
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Post</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
