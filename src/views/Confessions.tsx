import NavBar from "../components/NavBar";
import { useContext, useState } from "react";

import { db } from "../../firebase";
import { ref, push, set, remove, get } from "firebase/database";
import { auth } from "../../firebase";
import { DataContext } from "../../context/DataContext";
import { Confession } from "../../data/Confession";
import { maskId } from "../../utilities/maskId";
import { FaTrashAlt } from "react-icons/fa";

interface Comment {
  id: string;
  author: string;
  content: string;
  replies: Comment[];
}

function Confessions() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleComments, setVisibleComments] = useState<string[]>([]);
  const [commentingOn, setCommentingOn] = useState<string | null>(null); // Track input visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConfession, setNewConfession] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");

  const { confessions } = useContext(DataContext);

  const handleReplyClick = (commentId: string) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  const handleToggleComments = (confessionId: string) => {
    setVisibleComments((prev) =>
      prev.includes(confessionId)
        ? prev.filter((id) => id !== confessionId)
        : [...prev, confessionId]
    );
  };

  const handleToggleCommentInput = (confessionId: string) => {
    setCommentingOn((prev) => (prev === confessionId ? null : confessionId));
  };

  const filteredConfessions = confessions.filter((confession: Confession) =>
    confession.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitConfession = async () => {
    if (!newConfession.trim()) return;

    const confessionsRef = ref(db, "confessions");
    const newConfessionRef = push(confessionsRef);

    const confessionData = {
      id: newConfessionRef.key,
      author: auth?.currentUser?.uid || "Anonymous",
      content: newConfession,
      datePosted: new Date().toISOString(),
    };

    await set(newConfessionRef, confessionData);
    setNewConfession("");
    setIsModalOpen(false);
  };

  const addComment = async (confessionId: string) => {
    if (!newComment.trim()) return;

    const commentsRef = ref(db, "comments");
    const newCommentRef = push(commentsRef);

    const commentData = {
      id: newCommentRef.key,
      confessionId, // Link to confession
      author: auth?.currentUser?.uid || "Anonymous",
      content: newComment,
    };

    await set(newCommentRef, commentData);
    setNewComment("");
  };

  const addReply = async (parentId: string) => {
    if (!newReply.trim()) return;

    const repliesRef = ref(db, "replies");
    const newReplyRef = push(repliesRef);

    const replyData = {
      id: newReplyRef.key,
      commentId: parentId, // Parent can be a comment or a reply
      author: auth?.currentUser?.uid || "Anonymous",
      content: newReply,
    };

    await set(newReplyRef, replyData);
    setNewReply("");
    setReplyingTo(null);
  };

  const handleDelete = async (confessionId: string) => {
    try {
      const confirm = window.confirm("Are you sure? this can't be undone");

      if (!confirm) {
        return;
      }

      // Reference to the confession
      const confessionRef = ref(db, `confessions/${confessionId}`);

      // Get all comments related to the confession
      const commentsSnapshot = await get(ref(db, "comments"));
      if (commentsSnapshot.exists()) {
        const commentsData = commentsSnapshot.val();
        const relatedComments = Object.keys(commentsData).filter(
          (commentId) => commentsData[commentId].confessionId === confessionId
        );

        // Get all replies related to the deleted comments
        const repliesSnapshot = await get(ref(db, "replies"));
        if (repliesSnapshot.exists()) {
          const repliesData = repliesSnapshot.val();
          const relatedReplies = Object.keys(repliesData).filter((replyId) =>
            relatedComments.includes(repliesData[replyId].commentId)
          );

          // Delete all related replies
          await Promise.all(
            relatedReplies.map((replyId) =>
              remove(ref(db, `replies/${replyId}`))
            )
          );
        }

        // Delete all related comments
        await Promise.all(
          relatedComments.map((commentId) =>
            remove(ref(db, `comments/${commentId}`))
          )
        );
      }

      // Delete the confession
      await remove(confessionRef);

      console.log(
        `Confession ${confessionId} and its related comments & replies deleted.`
      );
    } catch (error) {
      console.error("Error deleting confession and related data:", error);
    }
  };

  const renderComments = (
    comments: Comment[],
    confessionId: string,
    _parentId = ""
  ) => {
    return comments.map((comment: Comment) => (
      <div key={comment.id} className="pl-4 border-l border-gray-300 mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full">
            <img
              src="/images/anonymous.png"
              alt="User"
              className="w-full aspect-square rounded-full"
            />
          </div>
          <div>
            <div className="font-semibold">{maskId(comment.author)}</div>
            <p className="text-xl">{comment.content}</p>
          </div>
        </div>

        {/* Reply button */}
        <button
          className="text-blue-500 text-sm mt-2"
          onClick={() => handleReplyClick(comment.id)}
        >
          {replyingTo === comment.id ? "Cancel" : "Reply"}
        </button>

        {/* Reply input field */}
        {replyingTo === comment.id && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Write a reply..."
              className="border p-2 rounded-md w-full"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-md mt-2"
              onClick={() => addReply(comment.id)}
            >
              Reply
            </button>
          </div>
        )}

        {/* Render Replies Recursively */}
        {comment.replies.length > 0 && (
          <div className="ml-4">
            {renderComments(comment.replies, confessionId, comment.id)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max mx-auto h-screen flex flex-col overflow-y-scroll no-scrollbar">
      <NavBar />

      <div className="h-[80px]"></div>

      {/* Search functionality */}
      <div className="flex justify-center p-4">
        <input
          type="text"
          placeholder="Search confessions..."
          className="border p-2 rounded-md w-full max-w-xl bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md ml-4"
          onClick={() => setIsModalOpen(true)}
        >
          CONFESS
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-[1000px] mx-auto  w-full">
        {filteredConfessions?.length <= 0 && (
          <h1 className="text-center text-5xl text-white font-bold">
            No Confessions Yet
          </h1>
        )}
        {filteredConfessions.map((confession: Confession) => (
          <div
            key={confession.id}
            className="bg-white p-4 rounded-lg shadow-md relative"
          >
            <FaTrashAlt
              className="absolute text-3xl text-red-700 right-4"
              onClick={() => handleDelete(confession.id)}
            />
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full">
                <img
                  src="/images/anonymous.png"
                  alt="User"
                  className="w-full aspect-square rounded-full"
                />
              </div>
              <div>
                <div className="font-semibold">{confession.author}</div>
                <div className="text-sm text-gray-500">
                  {confession.datePosted}
                </div>
              </div>
            </div>
            <p className="mt-2 text-3xl">{confession.content}</p>

            {/* Toggle Comment Input */}
            <button
              className="text-blue-500 text-sm mt-4"
              onClick={() => handleToggleCommentInput(confession.id)}
            >
              {commentingOn === confession.id ? "Cancel" : "Comment"}
            </button>

            {/* Show input field when toggled */}
            {commentingOn === confession.id && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="border p-2 rounded-md w-full"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-md mt-2"
                  onClick={() => addComment(confession.id)}
                >
                  Submit
                </button>
              </div>
            )}

            {/* Toggle Comments Button */}
            {confession.comments.length > 0 && (
              <button
                className="text-blue-500 text-sm mt-4 mx-6"
                onClick={() => handleToggleComments(confession.id)}
              >
                {visibleComments.includes(confession.id)
                  ? "Hide comments"
                  : "Show comments"}
              </button>
            )}

            {/* Comments Section */}
            {visibleComments.includes(confession.id) && (
              <div className="mt-4">
                {renderComments(confession.comments, confession.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Add a Confession</h2>
            <textarea
              className="w-full border rounded-md p-2"
              placeholder="Write your confession..."
              value={newConfession}
              onChange={(e) => setNewConfession(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleSubmitConfession}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Confessions;
