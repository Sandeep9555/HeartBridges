import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../../utils/connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300">
        <h1 className="text-xl font-semibold text-gray-600">
          No Connections Found 💔
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-pink-700 mb-10">
        Your Connections 💞
      </h1>

      <div className="flex flex-col gap-6 items-center">
        {connections.map(
          ({ _id, firstName, lastName, photoUrl, age, gender, about }) => (
            <div
              key={_id}
              className="w-full max-w-2xl flex items-center p-5 rounded-2xl shadow-md bg-white hover:shadow-xl transition duration-300 border border-pink-300"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-pink-400">
                <img
                  src={photoUrl}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {firstName} {lastName}
                </h2>
                {age && gender && (
                  <p className="text-sm text-gray-600 mb-1">
                    {age}, {gender}
                  </p>
                )}
                <p className="text-sm text-gray-500 line-clamp-2">{about}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Connections;
