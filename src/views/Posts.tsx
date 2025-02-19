import emailjs from "emailjs-com";
import { useContext, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import UploadForm from "../components/UploadForm";
import { DataContext } from "../../context/DataContext";
import AOS from "aos";
import "aos/dist/aos.css";
import Modal from "../components/Modal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../firebase";
import { ref as dbRef, set } from "firebase/database";
import { Post as TypePost } from "../../data/Post";

import { config } from "../../utilities/emailjs";
import { BASE_URL } from "../../utilities/BASE_URL";

function Posts() {
  const { posts } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAdmin, users } = useContext(DataContext);

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

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (!data?.content) {
        setError("No content to post");
        return;
      }

      const urls = [];
      if (data?.media || data.media.length > 0) {
        for (const file of data.media) {
          if (!(file instanceof File)) {
            setError("Invalid file type.");
            return;
          }

          const storageRef = ref(storage, `issco/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          const fileType = file?.name?.split(".")?.pop()?.toLowerCase();
          if (!fileType) {
            setError("Unable to determine the file");
            return;
          }

          const mediaType = ["jpg", "jpeg", "png", "gif"].includes(fileType)
            ? "image"
            : "video";

          urls.push({ url: downloadURL, type: mediaType });
        }
      }

      const newPost = {
        content: data.content,
        media: urls,
        datePosted: new Date().toISOString(),
        isHighlight: false,
      };

      const postRef = dbRef(db, "posts/" + Date.now());
      await set(postRef, newPost);
      setShowForm(false);

      if (users?.length > 0) {
        for (const usr of users.filter((usr: any) => usr?.email)) {
          const templateParams = {
            from_name: "ISSCOHUB",
            message: "A new post has been uploaded!.",
            to_email: usr.email,
            link: `${BASE_URL}/posts`,
          };

          await emailjs.send(
            config[0],
            config[1],

            templateParams,
            config[2]
          );
        }
      }
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max mx-auto">
      <NavBar />
      {error && (
        <Modal type="error" text={error} onClose={() => setError("")} />
      )}
      <div className="pt-[80px] screen overflow-scroll no-scrollbar">
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
              <UploadForm onSubmit={handleFormSubmit} loading={loading} />
            </div>
          )}
          <div className="flex-1 overflow-scroll no-scrollbar mt-4 pb-[100px] px-2">
            {posts.map((post: TypePost, index: number) => (
              <Post key={index} post={post} setError={setError} />
            ))}
            {posts?.length <= 0 && (
              <h1 className="text-center text-4xl text-white mt-8">
                No Posts Yet
              </h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;
