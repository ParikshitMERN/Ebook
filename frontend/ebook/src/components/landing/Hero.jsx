import { ArrowRight, Sparkles, BookOpen, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import HERO_IMG from "../../assets/hero-img.png";
const Hero = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="">
          {/* Left Content */}
          <div className="">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span className="">AI-Powered Publishing</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 leading-tight">
            Create Stunning
            <span className="block text-blue-600">Ebooks in Minutes</span>
          </h1>

          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-xl">
            From idea to published ebook, our AI-powered platform helps you
            write, design, and export professional-quality books effortlessly.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <span>Start Creating for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#demo"
              className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              <span>Watch Demo</span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-6 mt-10 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-500">Books Created</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-500">User Rating</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">10min</div>
              <div className="text-sm text-gray-500">Avg. Creation</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-100 rounded-2xl blur-xl opacity-40"></div>
            <div className="relative bg-white shadow-xl rounded-2xl p-4">
              <img
                src={HERO_IMG}
                alt="AI Ebook Creator Dashboard"
                className="rounded-xl w-full"
              />

              <div className="absolute top-4 left-4 bg-white shadow-md rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Processing</div>
                    <div className="text-sm font-semibold">AI Generation</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white shadow-md rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Completed</div>
                    <div className="text-sm font-semibold">247 Pages</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -left-8 w-20 h-20 bg-violet-400/20 rounded-2xl rotate-12"></div>
            <div className="absolute bottom-6 -right-6 w-32 h-32 bg-purple-400/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
