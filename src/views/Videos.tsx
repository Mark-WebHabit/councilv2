import { useContext, useState } from "react";
import NavBar from "../components/NavBar";
import { ref, push, remove } from "firebase/database";
import { db } from "../../firebase";
import Modal from "../components/Modal";
import { DataContext } from "../../context/DataContext";
import { Videos as Vid } from "../../data/Videos";
import { FaTrash } from "react-icons/fa"; // Import Trash Icon

function Videos() {
  const { videos, isAdmin } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!videoLink.includes("youtube.com") && !videoLink.includes("youtu.be")) {
      alert("Please enter a valid YouTube link.");
      return;
    }

    let videoId;
    let timestamp = "";

    try {
      const url = new URL(videoLink);

      if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.split("/")[1];
      } else if (url.pathname.includes("/live/")) {
        videoId = url.pathname.split("/live/")[1].split("?")[0];
      } else if (url.searchParams.get("v")) {
        videoId = url.searchParams.get("v");
      }

      const timeParam =
        url.searchParams.get("t") || url.searchParams.get("start");
      if (timeParam) {
        timestamp = `?start=${parseInt(timeParam)}`;
      }
    } catch (error) {
      alert("Invalid YouTube URL.");
      return;
    }

    if (!videoId) {
      alert("Invalid YouTube URL.");
      return;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}${timestamp}`;

    const newVideo = {
      embed: embedUrl,
      caption,
      datePosted: new Date().toISOString(),
    };

    try {
      const videosRef = ref(db, "videos");
      await push(videosRef, newVideo);

      setIsModalOpen(false);
      setVideoLink("");
      setCaption("");
    } catch (error: any) {
      setError(error?.message);
    }
  };

  // ✅ Delete Video Function
  const deleteVideo = async (videoId: string | undefined) => {
    if (!videoId) {
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;

    try {
      await remove(ref(db, `videos/${videoId}`));
    } catch (error: any) {
      setError(error?.message);
    }
  };

  return (
    <div className="max h-screen mix-auto">
      <NavBar />
      {error && (
        <Modal type="error" text={error} onClose={() => setError("")} />
      )}
      <div className="h-full pt-[80px] max-w-[1000px] mx-auto p-4 overflow-scroll no-scrollbar ">
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg  mx-auto block my-4 hover:bg-red-700"
          >
            Upload Video
          </button>
        )}

        {/* Video Display */}
        <div className="space-y-6  pt-4">
          {videos.map((video: Vid, index: number) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-8 relative"
            >
              {/* Trash Button (Delete) */}
              {isAdmin && (
                <button
                  onClick={() => deleteVideo(video?.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash size={20} />
                </button>
              )}

              <div className="relative w-full aspect-video">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={video.embed}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-900">
                  {video.caption || "No caption available"}
                </p>
                <p className="text-sm text-gray-500">
                  Posted on: {video.datePosted}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Upload a New Video</h2>
            <input
              type="text"
              placeholder="Enter YouTube link"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Enter a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Videos;
