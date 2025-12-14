"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage"; // IMPORTANT: default import

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // cropper states
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

  // load profile
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.push("/teamchallenge/auth/login");

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setNickname(profile.nickname ?? "");
        setDob(profile.dob ?? "");
        setCity(profile.city ?? "");
        setPhone(profile.phone ?? "");
        setPhoto(profile.profile_photo ?? null);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  // handle file input
  const handlePhotoInput = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // save profile
  const handleSaveProfile = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    let finalPhotoUrl = photo;

    // upload new cropped image
    // upload new cropped image
if (selectedPhoto) {
  const filePath = `profile-${userId}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, selectedPhoto, { upsert: true });

  if (error) {
    setMessage(error.message);
    setSaving(false);
    return;
  }

  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  finalPhotoUrl = data.publicUrl;

  // 🔥 FIX: update local state immediately
  setPhoto(finalPhotoUrl);
  setPreviewPhoto(finalPhotoUrl);
}


    const { error: updateErr } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      nickname,
      dob,
      city,
      phone,
      profile_photo: finalPhotoUrl,
    });

    if (updateErr) {
      setMessage(updateErr.message);
      setSaving(false);
      return;
    }

    // redirect
    // After profile completed → go to team list
router.push("/teamchallenge/profile/dashboard");

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">

          <h1 className="text-3xl font-bold text-center mb-8">Complete Your Profile</h1>

          <form onSubmit={handleSaveProfile} className="space-y-5">

            {/* PROFILE PHOTO */}
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm text-gray-400 mb-3">Profile Photo</p>

              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-700 bg-white flex items-center justify-center">

                  {previewPhoto ? (
                    <img
                      key={previewPhoto + Date.now()}
                      src={previewPhoto}
                      className="w-full h-full object-cover"
                    />
                  ) : photo ? (
                    <img
                      key={photo + Date.now()}
                      src={photo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-xs">No Photo</span>
                  )}

                </div>

                <label
                  htmlFor="profilePhotoUpload"
                  className="absolute bottom-1 right-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer transition shadow-lg"
                >
                  ✏️
                </label>

                <input
                  id="profilePhotoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoInput}
                />
              </div>
            </div>

            {/* name */}
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Nickname</label>
              <input
                className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">City</label>
              <input
                className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input
                className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {message && (
              <p className="text-red-400 text-center text-sm">{message}</p>
            )}

            <button
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-xl border border-gray-700 w-[90%] max-w-md">

            <h2 className="text-xl font-bold mb-4 text-center">Adjust Photo</h2>

            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <Cropper
                image={cropSrc!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                // IMPORTANT: must use croppedAreaPixels
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />

              <button
                className="bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
                onClick={async () => {
                  if (!cropSrc || !croppedAreaPixels) return;

                  // CROP TO BLOB
                  const blob = await getCroppedImg(
                    cropSrc,
                    croppedAreaPixels,
                    zoom
                  );

                  // make file
                  const file = new File([blob], "profile.jpg", {
                    type: "image/jpeg",
                  });
                  setSelectedPhoto(file);

                  // show instant preview
                  const previewURL = URL.createObjectURL(file);
                  setPreviewPhoto(previewURL);

                  setShowCropper(false);
                }}
              >
                Save Crop
              </button>

              <button
                className="bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
