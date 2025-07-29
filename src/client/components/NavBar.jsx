import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../../utils/userSlice";
import { useEffect, useState } from "react";
import { setSelectedConnection } from "../../utils/messageSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#user-menu")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-pink-600 tracking-wide">
          💖 HeartBridge
        </Link>

        {/* Avatar Dropdown */}
        {user && (
          <div className="relative" id="user-menu">
            <img
              src={user.photoUrl}
              alt="user"
              className="w-10 h-10 rounded-full border-2 border-pink-400 cursor-pointer"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            />

            {/* Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 transform transition-all duration-200 ease-in-out ${
                isDropdownOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {[
                { name: "My Profile", path: "/profile" },
                { name: "Feed", path: "/feed" },
                { name: "Requests", path: "/requests" },
                { name: "Connections", path: "/connections" },
                { name: "Chat", path: "/message" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-100 hover:text-pink-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={logoutHandler}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-100 hover:text-pink-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
