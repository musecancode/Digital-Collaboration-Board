"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"

const colorOptions = [
	{ name: "Sky", value: "bg-sky-100", textColor: "text-sky-800" },
	{ name: "Purple", value: "bg-purple-100", textColor: "text-purple-800" },
	{ name: "Pink", value: "bg-pink-100", textColor: "text-pink-800" },
	{ name: "Yellow", value: "bg-yellow-100", textColor: "text-yellow-800" },
	{ name: "Green", value: "bg-green-100", textColor: "text-green-800" },
	{ name: "Orange", value: "bg-orange-100", textColor: "text-orange-800" },
]

export default function CreateBoardModal({ isOpen, onClose, onCreateBoard, onUpdateBoard, board }) {
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [selectedColor, setSelectedColor] = useState(colorOptions[0])

	useEffect(() => {
		if (board) {
			setTitle(board.title)
			setDescription(board.description)
			setSelectedColor(colorOptions.find((c) => c.value === board.color) || colorOptions[0])
		} else {
			resetForm()
		}
	}, [board])

	const handleSubmit = (e) => {
		e.preventDefault()
		const boardData = {
			title,
			description,
			color: selectedColor.value,
			textColor: selectedColor.textColor,
		}

		if (board) {
			onUpdateBoard({ ...board, ...boardData })
		} else {
			onCreateBoard(boardData)
		}
		resetForm()
	}

	const resetForm = () => {
		setTitle("")
		setDescription("")
		setSelectedColor(colorOptions[0])
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{board ? "Edit Board" : "Create New Board"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label htmlFor="title" className="text-sm font-medium">
								Add a name for your board
							</label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value.slice(0, 16))}
								placeholder="Enter board title (max 16 characters)"
								maxLength={16}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="description" className="text-sm font-medium">
								Description (optional)
							</label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter board description"
								rows={2}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Select board colour</label>
							<p className="text-xs text-muted-foreground mb-2">
								Here are some templates to help you get started
							</p>
							<div className="flex flex-wrap gap-2">
								{colorOptions.map((color) => (
									<button
										key={color.value}
										type="button"
										className={`w-8 h-8 rounded-full ${color.value} flex items-center justify-center transition-all ${
											selectedColor.value === color.value ? "ring-2 ring-offset-2 ring-black" : ""
										}`}
										onClick={() => setSelectedColor(color)}
									>
										{selectedColor.value === color.value && (
											<Check className="h-4 w-4 text-gray-700" />
										)}
									</button>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={resetForm}>
							Cancel
						</Button>
						<Button type="submit">{board ? "Update Board" : "Create Board"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
