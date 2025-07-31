import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../utils/userSlice";
import { useEffect, useState } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Get current route
  const userData = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching user:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Avoid fetching user if route is public
    const publicPaths = ["/login", "/signup"];
    if (publicPaths.includes(location.pathname)) {
      setLoading(false);
      return;
    }

    if (!userData || !Object.keys(userData).length) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
