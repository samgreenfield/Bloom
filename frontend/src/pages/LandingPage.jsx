import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

{/* 
  CLASSPAGE.JSX:
  The component for home page. Displays:
    - Logo
    - Welcome message
    - Get started button
    - Footer:
        - Demo button
        - Contact link
        - Source code link
*/}

export default function LandingPage() {
    const navigate = useNavigate();

    // Get started button navigates to signin page
    const handleGetStarted = () => {
        navigate("/signin"); 
    };

    // If the user is signed in, navigate to dashboard
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          window.location.href = "/dashboard";
        }
      }, []);

    return (
        <div className="min-h-screen bg-beige flex flex-col">
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
            <p className="text-lg mb-2 sm:mb-0"></p>
            <div className="flex gap-4 text-lg">
                <a
                    href="/demo"
                    className="hover:underline cursor-pointer"
                    >
                    Try Demo
                </a>
                <a
                    href="mailto:samgreenfield0@gmail.com"
                    className="hover:underline"
                >
                    Contact
                </a>
                <a
                    href="https://github.com/samgreenfield/Bloom"
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