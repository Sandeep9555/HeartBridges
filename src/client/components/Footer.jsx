import React from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Social Media Section */}
        <div className="flex space-x-6 mb-6 md:mb-0">
          <a
            href="#"
            aria-label="Facebook"
            className="text-pink-600 hover:text-blue-600 transition-colors duration-300"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://www.instagram.com/"
            aria-label="Instagram"
            className="text-pink-600 hover:text-pink-500 transition-colors duration-300"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://www.youtube.com/"
            aria-label="YouTube"
            className="text-pink-600 hover:text-red-600 transition-colors duration-300"
          >
            <FaYoutube size={24} />
          </a>
          <a
            href="mailto:sandeepsingg6392@gmail.com"
            aria-label="Email"
            className="text-pink-600 hover:text-green-500 transition-colors duration-300"
          >
            <FaEnvelope size={24} />
          </a>
        </div>

        {/* Newsletter Section */}
        <div className="w-full max-w-sm">
          <form className="flex rounded-full overflow-hidden shadow">
            <input
              type="email"
              placeholder="Your email"
              aria-label="Email for newsletter"
              className="flex-grow px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-l-full"
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-5 py-2 rounded-r-full hover:bg-pink-600 transition-colors duration-300 font-semibold text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-500 mt-6 text-sm select-none">
        <p>© 2024 HeartBridge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
