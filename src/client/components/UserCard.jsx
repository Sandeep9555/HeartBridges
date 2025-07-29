import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../../utils/feedSlice";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const [isExpanded, setIsExpanded] = useState(false);
  const [interestLevel, setInterestLevel] = useState(50);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center flex flex-col items-center max-w-sm w-full"
    >
      {/* Navigate to profile on card click (except buttons) */}
      <div
        onClick={() => navigate(`/profile/${_id}`)}
        className="cursor-pointer w-full flex flex-col items-center"
      >
        <img
          src={photoUrl}
          alt="User"
          className="w-28 h-28 object-cover rounded-full border-4 border-pink-200 shadow-sm mb-4"
        />
        <h2 className="text-xl font-semibold text-pink-700">
          {firstName} {lastName}
        </h2>
        {age && gender && (
          <p className="text-gray-500 text-sm mb-2">
            {age}, {gender}
          </p>
        )}
        <p
          className="text-gray-600 text-sm mb-2"
          onClick={(e) => {
            e.stopPropagation(); // prevent navigation
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? about : `${about.substring(0, 80)}...`}
          <span className="ml-2 text-pink-500 font-medium">
            {isExpanded ? "Show Less" : "Read More"}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 my-3 w-full">
        <label className="text-sm text-gray-600">Interest:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={interestLevel}
          onChange={(e) => setInterestLevel(e.target.value)}
          className="accent-pink-500 w-1/2"
        />
        <span className="text-sm text-gray-600">{interestLevel}%</span>
      </div>

      {/* Buttons should not trigger navigation */}
      <div className="flex justify-center gap-4 mt-4 w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation(); // prevent navigation
            handleSendRequest("ignored", _id);
          }}
          className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-200 transition text-sm font-medium"
        >
          Ignore
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation(); // prevent navigation
            handleSendRequest("interested", _id);
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition text-sm font-medium"
        >
          Interested
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserCard;
