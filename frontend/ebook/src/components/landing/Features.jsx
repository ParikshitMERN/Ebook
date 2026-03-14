import React from "react";
import { FEATURES } from "../../utils/data";
const Features = () => {
  return (
    <div id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-1 bg-blue-600 rounded"></span>
            <span className="text-blue-600 font-semibold uppercase tracking-wide">
              Features
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Everything You Need to
            <span className="block text-blue-600">Create Your Ebook</span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Our platform is packed with powerful features to help you write,
            design, and publish your ebook effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-10 transition"></div>
                <div className="p-6 flex flex-col gap-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="text-white w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all">
                      Learn more
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Ready to get started?</p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <span>Start Creating Today</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Features;
