import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DataContextProvider from "../context/DataContext";

// screens
import Home from "./views/Home";
import Council from "./views/Council";
import Auth from "./views/Auth";
import Posts from "./views/Posts";
import Events from "./views/Events";
import Articles from "./views/Articles";
import Confessions from "./views/Confessions";

function App() {
  return (
    <DataContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/council/:id" element={<Council />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/events" element={<Events />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/confessions" element={<Confessions />} />
        </Routes>
      </Router>
    </DataContextProvider>
  );
}

export default App;
