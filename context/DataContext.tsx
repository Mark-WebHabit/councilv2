import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { get, ref, getDatabase, onValue, off } from "firebase/database";
import { db } from "../firebase";
import { maskId } from "../utilities/maskId";

export const DataContext = createContext<any | null>(null);

import { Post } from "../data/Post";
import { Event } from "../data/Event";
import { Like } from "../data/Like";
import { Article } from "../data/Article";
import { Confession, Comment, Reply } from "../data/Confession";
import { Videos } from "../data/Videos";
interface View {
  id: string;
  users: string[];
}

function DataContextProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Object | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [postLikes, setPostLikes] = useState<Like[]>([]);
  const [eventLikes, setEventLikes] = useState<Like[]>([]);
  const [postViews, setPostViews] = useState<View[]>([]);
  const [eventViews, setEventViews] = useState<View[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [videos, setVideos] = useState<Videos[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Use a Map to store unique users by email
        const uniqueUsersMap = new Map();
        usersArray.forEach((user) => {
          if (!uniqueUsersMap.has(user.email)) {
            uniqueUsersMap.set(user.email, user);
          }
        });

        // Convert the Map back to an array
        const uniqueUsers = Array.from(uniqueUsersMap.values());

        setUsers(uniqueUsers);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const videosRef = ref(db, "videos");

    const unsubscribe = onValue(videosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videosArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Ensure every video has a valid `datePosted`
        const uniqueVideos = new Map();
        videosArray.forEach((vid) => {
          if (!uniqueVideos.has(vid.embed)) {
            uniqueVideos.set(vid.embed, {
              ...vid,
              datePosted: vid.datePosted || "1970-01-01T00:00:00.000Z", // Default full ISO format
            });
          }
        });

        // Convert Map to array and sort by `datePosted`
        const sortedVideos = Array.from(uniqueVideos.values()).sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );

        setVideos(sortedVideos);
      } else {
        setVideos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setAuthUser(user);

        const userRef = ref(db, "users/" + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setIsAdmin(snapshot.val()?.status !== "user");
          setUserData(snapshot.val());
        } else {
          setUserData(null);
        }
      } else {
        setAuthUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "posts");

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort posts by datePosted in descending order
        postsArray.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );

        // Integrate post likes and views
        postsArray.forEach((post) => {
          const like = postLikes.find((like) => like.id === post.id);
          post.likes = like ? like.users : [];
          const view = postViews.find((view) => view.id === post.id);
          post.views = view ? view.users.length : 0;
        });

        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, [postLikes, postViews]);

  useEffect(() => {
    const db = getDatabase();
    const eventsRef = ref(db, "events");

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort events by datePosted in descending order
        eventsArray.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );

        // Integrate event likes and views
        eventsArray.forEach((event) => {
          const like = eventLikes.find((like) => like.id === event.id);
          event.likes = like ? like.users : [];
          const view = eventViews.find((view) => view.id === event.id);
          event.views = view ? view.users.length : 0;
        });

        setEvents(eventsArray);
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, [eventLikes, eventViews]);

  useEffect(() => {
    const db = getDatabase();
    const postLikesRef = ref(db, "postLikes");

    const unsubscribe = onValue(postLikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const likesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPostLikes(likesArray);
      } else {
        setPostLikes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const eventLikesRef = ref(db, "eventLikes");

    const unsubscribe = onValue(eventLikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const likesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEventLikes(likesArray);
      } else {
        setEventLikes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postViewsRef = ref(db, "views");

    const unsubscribe = onValue(postViewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const viewsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPostViews(viewsArray);
      } else {
        setPostViews([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const eventViewsRef = ref(db, "views");

    const unsubscribe = onValue(eventViewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const viewsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEventViews(viewsArray);
      } else {
        setEventViews([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const articlesRef = ref(db, "articles");

    const unsubscribe = onValue(articlesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const articlesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort articles by datePosted in descending order
        articlesArray.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );

        // Mark the most recent article as "latest"
        if (articlesArray.length > 0) {
          articlesArray[0].latest = true;
        }

        setArticles(articlesArray);
      } else {
        setArticles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const highlightsArray = [
      ...posts
        .filter((post) => post.isHighlight)
        .map((post) => ({ ...post, type: "post" })),
      ...events
        .filter((event) => event.isHighlight)
        .map((event) => ({ ...event, type: "event" })),
      ...articles
        .filter((article) => article.isHighlight)
        .map((article) => ({ ...article, type: "article" })),
    ];

    setHighlights(highlightsArray);
  }, [posts, events, articles]);

  useEffect(() => {
    const confessionsRef = ref(db, "confessions");
    const commentsRef = ref(db, "comments");
    const repliesRef = ref(db, "replies");

    const fetchData = () => {
      try {
        onValue(confessionsRef, (confessionsSnapshot) => {
          const confessionsData = confessionsSnapshot.exists()
            ? confessionsSnapshot.val()
            : {};

          onValue(commentsRef, (commentsSnapshot) => {
            const commentsData = commentsSnapshot.exists()
              ? commentsSnapshot.val()
              : {};

            onValue(repliesRef, (repliesSnapshot) => {
              const repliesData = repliesSnapshot.exists()
                ? repliesSnapshot.val()
                : {};

              // Function to recursively map replies
              const mapReplies = (parentId: string): Reply[] => {
                return Object.values(repliesData)
                  .filter((reply: any) => reply.commentId === parentId)
                  .map((reply: any) => ({
                    id: reply.id,
                    author: maskId(reply.author),
                    content: reply.content,
                    replies: mapReplies(reply.id), // Recursively fetch nested replies
                  }));
              };

              // Function to map comments and attach replies
              const mapComments = (confessionId: string): Comment[] => {
                return Object.values(commentsData)
                  .filter(
                    (comment: any) => comment.confessionId === confessionId
                  )
                  .map((comment: any) => ({
                    id: comment.id,
                    author: maskId(comment.author),
                    content: comment.content,
                    replies: mapReplies(comment.id), // Attach nested replies
                  }));
              };

              // Restructure confessions with nested comments and replies
              const structuredConfessions: Confession[] = Object.keys(
                confessionsData
              ).map((key) => ({
                id: key,
                author: maskId(confessionsData[key].author),
                datePosted: confessionsData[key].datePosted,
                content: confessionsData[key].content,
                comments: mapComments(key), // Attach comments with replies
              }));

              setConfessions(structuredConfessions);
            });
          });
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      // Clean up the listeners when the component unmounts
      off(confessionsRef);
      off(commentsRef);
      off(repliesRef);
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        authUser,
        userData,
        isAdmin,
        posts,
        events,
        postLikes,
        eventLikes,
        postViews,
        eventViews,
        articles,
        highlights,
        users,
        confessions,
        videos,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataContextProvider;
