import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
    navigate("/questionnaire"); // Or your sign-in/sign-up route
    };
    return (
        <div className="min-h-screen bg-beige flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 flex-col items-center justify-center text-center px-6">
            <img src={logo} className="h-20 w-20 mb- object-contain"/>
            <h1 className="text-5xl font-serif text-forest mb-4">
            Welcome to Bloom
            </h1>
            <p className="text-lg font-sans text-text mb-8">
                Grow knowledge. Track progress.
            </p>
            <button onClick={handleGetStarted} className="bg-beige text-forest border border-forest px-6 py-3 rounded-xl font-sans hover:bg-green-900 hover:text-beige transition">
            Get Started
        </button>
        </section>
        </div>
    );
}