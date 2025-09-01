import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages";
import Archive from "./pages/ArchivePage";
import GoalDetailsPage from "./pages/GoalDetailsPage";
import { useNavigate } from "react-router-dom";

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/ArchivePage" element={<Archive />} />
            <Route path="/goal/:id" element={<GoalDetailsPage />} />
        </Routes>
    </Router>
  );
}

export default App;