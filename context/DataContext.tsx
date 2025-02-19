import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { get, ref, getDatabase, onValue } from "firebase/database";
import { db } from "../firebase";

export const DataContext = createContext<any | null>(null);

import { Post } from "../data/Post";
import { Event } from "../data/Event";
import { Like } from "../data/Like";
import { Article } from "../data/Article";
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

    console.log(highlightsArray);
  }, [posts, events, articles]);

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
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataContextProvider;
