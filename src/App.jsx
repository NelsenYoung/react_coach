import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages";
import Archive from "./pages/ArchivePage";
import GoalDetailsPage from "./pages/GoalDetailsPage";
import HabitTrackerPage from "./pages/HabitTrackerPage";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "./components/supabaseClient";
import GoalsPage from "./pages/GoalsPage";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
        <Navbar />
        <Routes>
            <Route exact path="/" element={<Home />} />
            {/* Auth route */}
            <Route
              path="/LoginPage"
              element={
                !session ? (
                  <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
                ) : (
                  <Navigate to="/HabitTrackerPage" replace />
                )
              }
            />
            <Route exact path="/GoalsPage" element={session ? <GoalsPage session={session} /> : <Navigate to="/LoginPage" replace />} />
            <Route path="/ArchivePage" element={session ? <Archive session={session} /> : <Navigate to="/LoginPage" replace />} />
            <Route path="/goal/:id" element={session ? <GoalDetailsPage session={session} /> : <Navigate to="/LoginPage" replace />} />
            <Route path="/HabitTrackerPage" element={session ? <HabitTrackerPage session={session} /> : <Navigate to="/LoginPage" replace />} />
        </Routes>
    </Router>
  );
}

export default App;