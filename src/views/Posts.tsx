import { useState } from "react";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import UploadForm from "../components/UploadForm";

const initialPosts: { media: string | null; type: string | null }[][] = [
  [
    {
      media: "test.mp4",
      type: "video",
    },
    {
      media: "selfie.jpg",
      type: "image",
    },
  ],
  [
    {
      media: "selfie.jpg",
      type: "image",
    },
    {
      media: "test.mp4",
      type: "video",
    },
  ],
  [
    {
      media: null,
      type: null,
    },
  ],
];

function Posts() {
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);

  const handleUploadClick = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = (data: any) => {
    const newPost = [
      {
        media: data.media[0] ? URL.createObjectURL(data.media[0]) : null,
        type: data.media[0] ? data.media[0].type.split("/")[0] : null,
      },
    ];
    setPosts([...posts, newPost]);
  };

  return (
    <div className="max">
      <NavBar />
      <div className="w-screen pt-[80px] screen overflow-scroll no-scrollbar">
        <div className="w-full max-w-[1000px] h-full mx-auto border-x-2 border-white/10 pt-2 bg-[var(--fadebg)] flex flex-col">
          <button
            onClick={handleUploadClick}
            className="px-8 rounded-2xl mx-auto bg-[var(--bg)] py-2 text-xl flex items-center gap-4 text-white font-bold"
          >
            <img src="/images/add.png" alt="ADD" />
            UPLOAD
          </button>
          {showForm && (
            <div className="my-4 mx-10">
              <UploadForm onSubmit={handleFormSubmit} />
            </div>
          )}
          <div className="flex-1 overflow-scroll no-scrollbar mt-4 pb-[100px] px-2">
            {posts.map((post, index) => (
              <Post key={index} post={post} />
            ))}
            <h1 className="text-center text-4xl text-white mt-8">
              No Post Yet
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;
