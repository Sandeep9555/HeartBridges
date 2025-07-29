import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../../utils/feedSlice";
import { useEffect } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (!feed) return null;

  if (feed.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-200 to-pink-400 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h1 className="text-xl font-semibold text-pink-600">
            No New Users Found! 💔
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Please accept some connection requests to see more people!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-pink-400 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-pink-700 mb-10">
        💞 Discover People
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
        {feed.map((user) => (
          <div key={user._id} className="flex justify-center">
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
