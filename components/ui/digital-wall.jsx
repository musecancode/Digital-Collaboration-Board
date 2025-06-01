"use client"

import { useState, useEffect } from "react"
import BoardList from "./board-list"
import BoardView from "./board-view"
import CreateBoardModal from "./create-board-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Notification from "@/components/ui/notification"

export default function DigitalWall() {
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [notification, setNotification] = useState("")
  const [editingBoard, setEditingBoard] = useState(null)

  useEffect(() => {
    setIsClient(true)

    const savedBoards = localStorage.getItem("boards")
    if (savedBoards) {
      setBoards(JSON.parse(savedBoards))
    } else {
      const sampleBoard = {
        id: "sample-1",
        title: "Places around the world",
        description: "A collection of amazing places to visit",
        color: "bg-sky-50",
        textColor: "text-sky-800",
        posts: [
          {
            id: "post-1",
            title: "Galapagos Islands, Ecuador",
            content:
              "The Galapagos Islands is a volcanic archipelago in the Pacific Ocean. It's considered one of the world's foremost destinations for wildlife-viewing. A province of Ecuador, it lies about 1,000km off its coast. Its isolated terrain shelters a diversity of plant and animal species, many found nowhere else. Charles Darwin visited in 1835, and his observation of Galapagos' species later inspired his theory of evolution.",
            imageUrl:
              "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
            likes: 0,
            isLiked: false,
            isBookmarked: false,
            createdAt: "2023-07-25T10:00:00.000Z",
          },
        ],
        createdAt: new Date().toISOString(),
      }
      setBoards([sampleBoard])
      localStorage.setItem("boards", JSON.stringify([sampleBoard]))
    }
  }, [])

  useEffect(() => {
    if (isClient && boards.length > 0) {
      localStorage.setItem("boards", JSON.stringify(boards))
    }
  }, [boards, isClient])

  const filteredBoards = boards.filter((board) => board.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateBoard = (newBoard) => {
    const boardWithId = {
      ...newBoard,
      id: Date.now().toString(),
      posts: [],
      createdAt: new Date().toISOString(),
    }
    setBoards([...boards, boardWithId])
    setIsCreateModalOpen(false)
    setNotification("New board created")
  }

  const handleUpdateBoard = (updatedBoard) => {
    setBoards(boards.map((board) => (board.id === updatedBoard.id ? updatedBoard : board)))
    setNotification("Board updated")
  }

  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter((board) => board.id !== boardId))
    if (selectedBoard && selectedBoard.id === boardId) {
      setSelectedBoard(null)
    }
    setNotification("Board deleted")
  }

  const handleSelectBoard = (board) => {
    setSelectedBoard(board)
  }

  const handleBackToWall = () => {
    setSelectedBoard(null)
  }

  const handleCreatePost = (boardId, newPost) => {
    const postWithId = {
      ...newPost,
      id: Date.now().toString(),
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
    }

    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: [...board.posts, postWithId],
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleUpdatePost = (boardId, updatedPost) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: board.posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleDeletePost = (boardId, postId) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: board.posts.filter((post) => post.id !== postId),
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleLikePost = (boardId, postId) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: board.posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked,
              }
            }
            return post
          }),
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleBookmarkPost = (boardId, postId) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: board.posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                isBookmarked: !post.isBookmarked,
              }
            }
            return post
          }),
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleReorderPosts = (boardId, reorderedPosts) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return {
          ...board,
          posts: reorderedPosts,
        }
      }
      return board
    })

    setBoards(updatedBoards)

    if (selectedBoard && selectedBoard.id === boardId) {
      const updatedBoard = updatedBoards.find((b) => b.id === boardId)
      setSelectedBoard(updatedBoard)
    }
  }

  const handleReorderBoards = (reorderedBoards) => {
    setBoards(reorderedBoards)
  }

  return (
    <div className="min-h-screen">
      {!selectedBoard ? (
        <div className="container mx-auto p-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">My boards</h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search boards..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Create new board
              </Button>
            </div>
          </header>

          <BoardList 
            boards={filteredBoards} 
            onSelectBoard={handleSelectBoard} 
            onDeleteBoard={handleDeleteBoard}
            onReorderBoards={handleReorderBoards}
            onEditBoard={setEditingBoard}
          />
        </div>
      ) : (
        <BoardView
          board={selectedBoard}
          onUpdateBoard={handleUpdateBoard}
          onCreatePost={(newPost) => handleCreatePost(selectedBoard.id, newPost)}
          onUpdatePost={(updatedPost) => handleUpdatePost(selectedBoard.id, updatedPost)}
          onDeletePost={(postId) => handleDeletePost(selectedBoard.id, postId)}
          onLikePost={(postId) => handleLikePost(selectedBoard.id, postId)}
          onBookmarkPost={(postId) => handleBookmarkPost(selectedBoard.id, postId)}
          onReorderPosts={(reorderedPosts) => handleReorderPosts(selectedBoard.id, reorderedPosts)}
          onBackToWall={handleBackToWall}
        />
      )}

      <CreateBoardModal
        isOpen={isCreateModalOpen || !!editingBoard}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingBoard(null)
        }}
        onCreateBoard={handleCreateBoard}
        onUpdateBoard={handleUpdateBoard}
        board={editingBoard}
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
