"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function CreateTeamPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState<string>("");

  // form fields
  const [teamName, setTeamName] = useState("");
  const [motto, setMotto] = useState("");
  const [city, setCity] = useState("");

  // logo states
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // stored url or preview
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  // cropper states
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/teamchallenge/auth/login");
        return;
      }
      setUserId(data.user.id);

      // prefill city from profile if available
      const { data: profile } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", data.user.id)
        .single();

      if (profile?.city) setCity(profile.city);
      setLoading(false);
    };

    load();
  }, [router]);

  // when selecting a file open cropper (use base64 -> no CORS)
  const handleLogoInput = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // After cropping, create file and preview
  const handleSaveCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(cropSrc, croppedAreaPixels, zoom);
      const file = new File([blob], `team-logo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setSelectedLogo(file);
      const preview = URL.createObjectURL(file);
      setPreviewLogo(preview);
      setLogoUrl(preview); // show preview immediately
      setShowCropper(false);
    } catch (err: any) {
      console.error("Crop error:", err);
      setMessage("Failed to process logo. Try another image.");
    }
  };

  const handleCreateTeam = async (e: any) => {
    e.preventDefault();
    setMessage("");
    if (!teamName.trim()) {
      setMessage("Team name is required.");
      return;
    }
    setSubmitting(true);

    try {
      let publicLogoUrl: string | null = null;

      if (selectedLogo) {
        // upload to team-logos bucket
        const filePath = `team-${userId}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("team-logos")
          .upload(filePath, selectedLogo, { upsert: true });

        if (uploadErr) {
          throw new Error(uploadErr?.message || JSON.stringify(uploadErr));

        }

        const { data } = supabase.storage.from("team-logos").getPublicUrl(filePath);
        publicLogoUrl = data.publicUrl;
      }

      // insert team and return id
      const { data: teamData, error: teamErr } = await supabase
        .from("teams")
        .insert({
          team_name: teamName,
          logo: publicLogoUrl,
          motto: motto || null,
          city: city || null,
          leader_id: userId,
        })
        .select()
        .single();

      if (teamErr) throw new Error(teamErr.message);

      const teamId = teamData.id;

      // assign current user as team leader in team_members
      const { error: memberErr } = await supabase.from("team_members").insert({
        team_id: teamId,
        member_id: userId,
        role: "leader",
      });

      if (memberErr) throw new Error(memberErr.message);

      // success -> redirect to dashboard
      router.push("/teamchallenge/team/dashboard");
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white px-6 py-12">
        <div className="max-w-2xl mx-auto bg-black/50 p-8 rounded-xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-4 text-center">Create Team</h1>

          <form onSubmit={handleCreateTeam} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Team Name</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Motto (optional)</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">City</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* LOGO UPLOAD */}
            <div className="flex items-start gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Team Logo</p>
                <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-700 bg-black flex items-center justify-center">
                  {previewLogo ? (
                    <img
                      key={previewLogo + Date.now()}
                      src={previewLogo}
                      className="w-full h-full object-cover"
                      alt="logo preview"
                    />
                  ) : logoUrl ? (
                    <img
                      key={logoUrl + Date.now()}
                      src={logoUrl}
                      className="w-full h-full object-cover"
                      alt="logo"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No Logo</span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm mb-1">Upload & Edit Logo</label>

                <div className="flex gap-2">
                  <label
                    htmlFor="teamLogoUpload"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Choose file
                  </label>

                  <input
                    id="teamLogoUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoInput}
                  />

                  <button
                    type="button"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      // remove selected logo
                      setSelectedLogo(null);
                      setPreviewLogo(null);
                      setLogoUrl(null);
                    }}
                  >
                    Remove
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Recommended: square image. You will be able to crop after choosing.
                </p>
              </div>
            </div>

            {message && <p className="text-red-400 text-sm">{message}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                {submitting ? "Creating..." : "Create Team"}
              </button>

              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => router.push("/teamchallenge")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-xl border border-gray-700 w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center">Adjust Logo</h3>

            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <Cropper
                image={cropSrc!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
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

              <div className="flex gap-2">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  onClick={async () => {
                    if (!cropSrc || !croppedAreaPixels) return;
                    try {
                      const blob = await getCroppedImg(
                        cropSrc,
                        croppedAreaPixels,
                        zoom
                      );
                      const file = new File([blob], `teamlogo-${Date.now()}.jpg`, {
                        type: "image/jpeg",
                      });
                      setSelectedLogo(file);
                      const preview = URL.createObjectURL(file);
                      setPreviewLogo(preview);
                      setLogoUrl(preview);
                      setShowCropper(false);
                    } catch (err) {
                      console.error("logo crop error", err);
                      setMessage("Failed to crop logo. Try again.");
                    }
                  }}
                >
                  Save Crop
                </button>

                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => setShowCropper(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
