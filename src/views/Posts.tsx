import { useContext, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import UploadForm from "../components/UploadForm";
import { DataContext } from "../../context/DataContext";
import AOS from "aos";
import "aos/dist/aos.css";

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
  const { isAdmin } = useContext(DataContext);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 200,
      easing: "ease-in-sine",
      delay: 50,
    });
  }, []);

  const handleUploadClick = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = (data: any) => {
    const newPost = data.media
      .map((file: File) => {
        if (file) {
          return {
            media: URL.createObjectURL(file),
            type: file.type.split("/")[0],
          };
        }
        return null;
      })
      .filter(
        (event: { media: string | null; type: string | null } | null) =>
          event !== null
      );

    setPosts([...posts, ...newPost]);
  };

  return (
    <div className="max  mx-auto">
      <NavBar />
      <div className=" pt-[80px] screen overflow-scroll no-scrollbar">
        <div className="w-full max-w-[1000px] h-full mx-auto border-x-2 border-white/10 pt-2 bg-[var(--fadebg)] flex flex-col">
          {isAdmin && (
            <>
              <button
                onClick={handleUploadClick}
                className="px-8 rounded-2xl mx-auto bg-[var(--bg)] py-2 text-xl flex items-center gap-4 text-white font-bold"
              >
                <img src="/images/add.png" alt="ADD" />
                UPLOAD
              </button>

              <hr className="border-b-2 mt-2 border-white/30" />
            </>
          )}
          {showForm && (
            <div className="my-4 mx-10" data-aos="zoom-in">
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
