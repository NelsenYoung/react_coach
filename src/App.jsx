import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages";
import Archive from "./pages/ArchivePage";

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/ArchivePage" element={<Archive />} />
        </Routes>
    </Router>
  );
}

export default App;