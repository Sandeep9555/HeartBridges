import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion } from "framer-motion";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/public/${userId}`);
        setProfile(res.data);
      } catch (err) {
        setError("Failed to load user profile");
      }
    };

    fetchUser();
  }, [userId]);

  const handleSendRequest = async (status) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      navigate("/feed"); // Go back to feed after action
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Something went wrong.");
    }
  };

  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  if (!profile) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-300 flex flex-col justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-2xl text-center">
        <img
          src={profile.photoUrl}
          alt="Profile"
          className="h-48 w-48 mx-auto object-cover rounded-full border-4 border-pink-200"
        />
        <h2 className="text-3xl font-bold mt-4 text-pink-600">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-gray-500">
          {profile.age} • {profile.gender}
        </p>
        <p className="mt-6 text-gray-700 italic">"{profile.about}"</p>

        <div className="flex justify-center gap-4 mt-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendRequest("ignored")}
            className="bg-pink-100 text-pink-600 px-5 py-2 rounded-full hover:bg-pink-200 transition text-sm font-medium"
          >
            Ignore
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendRequest("interested")}
            className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600 transition text-sm font-medium"
          >
            Interested
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
