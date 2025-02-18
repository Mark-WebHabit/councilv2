import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { get, ref, getDatabase } from "firebase/database";

export const DataContext = createContext<any | null>(null);

function DataContextProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Object | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setAuthUser(user);
        const db = getDatabase();
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

  return (
    <DataContext.Provider value={{ authUser, userData, isAdmin }}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContextProvider;
