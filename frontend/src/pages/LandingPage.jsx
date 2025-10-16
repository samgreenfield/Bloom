import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/signin"); // Or your sign-in/sign-up route
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          window.location.href = "/dashboard";
        }
      }, []);

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
        <footer className="w-full bg-forest text-beige py-6 mt-auto flex flex-col sm:flex-row justify-between items-center px-6">
            <p className="text-lg mb-2 sm:mb-0">
                {/* &copy; {new Date().getFullYear()} Bloom. All rights reserved. */}
            </p>
            <div className="flex gap-4 text-lg">
                <a
                href="mailto:samgreenfield0@gmail.com"
                className="hover:underline"
                >
                Contact
                </a>
                <a
                href="https://github.com/samgreenfield/Bloom" // Replace with your repo
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                >
                Source Code
                </a>
            </div>
        </footer>
        </div>
    );
}