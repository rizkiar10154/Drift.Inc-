"use client";

import React, { useEffect, useState } from "react";

type GalleryItem = {
  id: string;
  url: string;
  category: string;
  caption: string;
  uploader?: string | null;
  uploaded_at: string;
  is_deleted: boolean;
};

type AttachmentPreview = {
  url: string;
};

export default function GalleryManager() {
  const [category, setCategory] = useState("Uncategorized");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<AttachmentPreview[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load gallery from API
  async function loadGallery() {
    try {
      const res = await fetch("/api/gallery");
      const json = await res.json();
      if (json.success) setGallery(json.data || []);
    } catch (err) {
      console.error("loadGallery", err);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  // Preview + file state
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);

    const newPreview = newFiles.map((f) => ({
      url: URL.createObjectURL(f),
    }));

    setPreview((prev) => [...prev, ...newPreview]);
  };

  const removePreview = (i: number) => {
    setPreview((prev) => prev.filter((_, idx) => idx !== i));
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Upload file → Supabase Storage
  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "gallery");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!json.success) return null;
    return json.url;
  }

  // Save gallery item in DB
  const publish = async () => {
    if (files.length === 0) {
      alert("Upload at least one photo");
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const url = await uploadImage(file);

        if (!url) continue;

        const payload = {
          url,
          category,
          caption,
        };

        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!json.success) console.error("Failed saving item");
      }

      // reset
      setFiles([]);
      setPreview([]);
      setCaption("");
      setCategory("Uncategorized");

      loadGallery();
    } catch (err) {
      console.error("publish", err);
      alert("Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  // Soft delete
  async function deleteItem(id: string) {
    if (!confirm("Delete image?")) return;

    const res = await fetch(`/api/gallery?id=${id}`, {
      method: "DELETE",
    });

    const json = await res.json();

    if (json.success) loadGallery();
    else alert("Delete failed");
  }

  return (
    <div className="max-w-5xl mx-auto bg-zinc-900/70 border border-red-800 p-8 rounded-2xl">

      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        📸 Gallery Manager
      </h2>

      {/* Upload Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 mt-1 bg-black/50 border border-red-700 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 mt-1 bg-black/50 border border-red-700 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm">Choose Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 bg-black/50 border border-red-700 rounded-lg mt-1"
          />
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {preview.map((p, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-red-700">
                <button
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 bg-black/70 px-2 py-1 rounded"
                >
                  ✖
                </button>
                <img src={p.url} className="w-full h-32 object-cover" />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={publish}
          disabled={uploading}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg text-white"
        >
          {uploading ? "Uploading..." : "Upload to Gallery"}
        </button>
      </div>

      {/* Gallery List */}
      <h3 className="text-xl font-semibold text-red-400 mt-10 mb-4">Uploaded Images</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <div key={item.id} className="relative border border-red-700 rounded-lg overflow-hidden">
            <img
              src={item.url}
              className="w-full h-32 object-cover"
            />

            <div className="absolute bottom-1 left-1 text-xs bg-black/60 px-2 py-1 rounded">
              {item.category}
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="absolute right-2 top-2 bg-black/70 text-red-400 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
