// app/admin/components/GalleryManager.tsx
"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";

type GalleryItem = {
  id?: string;
  _id?: string;
  url: string;
  category?: string;
  caption?: string;
  uploader?: string | null;
  uploadedAt?: string;
  isDeleted?: boolean;
};

const CATEGORIES = [
  "Race Day",
  "Track & Karts",
  "Customer Moments",
  "Events",
  "Highlight",
];

export default function GalleryManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // staging
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);

  // published images
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch images with category filter
  const fetchImages = async (category?: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", "1");
      query.set("limit", "200");
      if (category && category.toLowerCase() !== "all") query.set("category", category);

      const res = await fetch("/api/gallery?" + query.toString(), { cache: "no-store" });
      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : Array.isArray(json?.items) ? json.items : [];
      setImages(items);
    } catch (err) {
      console.error("fetchImages error:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(selectedCategory);
    // cleanup previews on unmount
    return () => previews.forEach((p) => { try { URL.revokeObjectURL(p); } catch {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch whenever category changes
  useEffect(() => {
    fetchImages(selectedCategory);
  }, [selectedCategory]);

  // handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected]);

    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // reset input so same file can be reselected later
    e.currentTarget.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCaptions((prev) => {
      const copy = { ...prev };
      delete copy[index];
      // shift indexes
      const shifted: Record<number, string> = {};
      let j = 0;
      Object.keys(copy)
        .map((k) => Number(k))
        .sort((a, b) => a - b)
        .forEach((k) => {
          shifted[j++] = copy[k];
        });
      return shifted;
    });
  };

  const handleCaptionChange = (index: number, value: string) => {
    setCaptions((prev) => ({ ...prev, [index]: value }));
  };

  // upload staged files
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files selected.");
      return;
    }
    if (!selectedCategory) {
      alert("Please choose a category.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      // append files and captions (caption_0, caption_1, ...)
      files.forEach((f, idx) => {
        form.append("files", f);
        form.append(`caption_${idx}`, captions[idx] || "");
      });

      // category required
      form.append("category", selectedCategory);

      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        console.error("Upload failed:", json);
        alert("Upload failed. Check server logs.");
      } else {
        // refresh published list (apply same category)
        await fetchImages(selectedCategory);

        // cleanup staged previews & files
        previews.forEach((p) => { try { URL.revokeObjectURL(p); } catch {} });
        setFiles([]);
        setPreviews([]);
        setCaptions({});
        alert(`Uploaded ${Array.isArray(json.data) ? json.data.length : json.data?.length ?? files.length} item(s).`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  // delete (soft) — uses id or _id if present
  const handleDeletePhoto = async (item: GalleryItem) => {
    const id = (item as any).id || (item as any)._id;
    if (!id) {
      if (!item.url) {
        alert("Cannot delete: no identifier.");
        return;
      }
    }
    if (!confirm("Delete this photo? (will be soft-deleted)")) return;

    try {
      const body: any = id ? { id } : { url: item.url };
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        console.error("Delete failed:", json);
        alert("Delete failed");
      } else {
        await fetchImages(selectedCategory);
        alert("Deleted.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. See console.");
    }
  };

  return (
    <section className="p-6 max-w-6xl">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Gallery Manager</h2>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border border-zinc-700 px-4 py-2 rounded text-white min-w-[220px]"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-300 mb-1 invisible">choose</label>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              disabled={uploading}
            >
              Choose Photos
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              disabled={uploading || files.length === 0}
            >
              {uploading ? "Uploading..." : "Upload Selected"}
            </button>
          </div>
        </div>
      </div>

      {/* Staging previews */}
      {previews.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm text-zinc-300 mb-2">Selected photos (staging)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((src, idx) => (
              <div key={`${src}-${idx}`} className="relative border rounded overflow-hidden p-2 bg-zinc-900">
                <img src={src} className="w-full h-40 object-cover rounded" alt={`preview-${idx}`} />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={captions[idx] || ""}
                  onChange={(e) => handleCaptionChange(idx, e.target.value)}
                  className="mt-2 w-full p-2 bg-transparent border border-zinc-700 rounded text-white"
                />
                <button
                  onClick={() => removeSelectedFile(idx)}
                  className="mt-2 w-full bg-red-600 py-1 rounded text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published gallery (admin view) */}
      <div>
        <h3 className="mb-3 text-lg">Published Gallery ({images.length})</h3>

        {loading ? (
          <p>Loading...</p>
        ) : images.length === 0 ? (
          <p className="italic text-zinc-400">No images</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((p) => {
              const id = (p as any).id ?? (p as any)._id ?? p.url;
              return (
                <div key={id} className="relative group bg-zinc-900 rounded overflow-hidden">
                  <img src={p.url} className="w-full h-40 object-cover" alt={p.caption || "gallery"} />
                  {p.caption && <div className="p-2 text-sm text-white">{p.caption}</div>}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                    <button
                      onClick={() => window.open(p.url, "_blank")}
                      className="mr-2 bg-white/10 px-2 py-1 rounded"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(p)}
                      className="bg-red-600 px-2 py-1 rounded text-white"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-1 py-0.5 rounded text-zinc-200">
                    {p.category || ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
