import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SigninPage from "./pages/SigninPage";
import DashboardPage from './pages/DashboardPage';
import ClassPage from './pages/ClassPage';
import LessonPage from './pages/LessonPage';
import DemoLogin from "./pages/DemoLogin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/class/:code" element={<ClassPage />} />
        <Route path="/class/:code/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/demo" element={<DemoLogin />} />
      </Routes>
    </Router>
  );
}