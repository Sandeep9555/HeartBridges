import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../../utils/requestSlice";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const reviewRequest = async (status, _id) => {
    try {
      setLoading(true);
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-100 via-pink-100 to-pink-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-pink-100 to-pink-100">
        <div className="text-center my-10 px-4 flex-grow">
          <h1 className="font-bold text-4xl text-gray-800 mb-6">
            Connection Requests
          </h1>
          <p className="text-lg text-gray-600">
            No new requests at the moment 🕊️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-pink-100 to-pink-100 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
        Connection Requests
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            request.fromUserId;

          return (
            <div
              key={_id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={photoUrl}
                  alt="user"
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {age && gender ? `${age}, ${gender}` : ""}
                  </p>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {about}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full"
                  onClick={() => reviewRequest("rejected", _id)}
                >
                  <FaTimesCircle />
                  Reject
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-full"
                  onClick={() => reviewRequest("accepted", _id)}
                >
                  <FaCheckCircle />
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
