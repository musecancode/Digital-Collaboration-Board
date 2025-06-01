"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon, Link, Loader2 } from "lucide-react"

export default function ImageUpload({ value, onChange, onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setUploadError("Please upload an image file")
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB")
      return
    }
    setIsUploading(true)
    setUploadError("")
    try {
      
      
      const imageUrl = URL.createObjectURL(file)
      onChange(imageUrl)
    } catch (error) {
      setUploadError("Failed to upload image")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ImageIcon className="h-4 w-4 mr-2" />
            )}
            Upload Image
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      {showUrlInput && (
        <Input
          type="url"
          placeholder="Or enter image URL..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}
      {value && !uploadError && (
        <div className="relative aspect-video mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover rounded-md"
            onError={() => setUploadError("Invalid image URL")}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}