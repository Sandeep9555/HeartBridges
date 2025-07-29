import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);

  return (
    user && (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 to-pink-400 flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-4xl space-y-8 flex flex-col">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100">
            <h2 className="text-center text-3xl font-bold text-pink-600 mb-6">
              Your Profile
            </h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={user?.photoUrl || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-md"
              />

              <div className="text-gray-700 w-full">
                <h3 className="text-2xl font-semibold text-pink-800">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-md text-gray-600 mt-1">{user?.email}</p>

                {user?.age && (
                  <p className="mt-2 text-sm text-gray-600">Age: {user?.age}</p>
                )}
                {user?.gender && (
                  <p className="mt-1 text-sm text-gray-600">
                    Gender: {user?.gender}
                  </p>
                )}
                {user?.about && (
                  <p className="mt-1 text-sm text-gray-600">
                    About: {user?.about}
                  </p>
                )}
                {user?.address && (
                  <p className="mt-1 text-sm text-gray-600">
                    Address: {user?.address}
                  </p>
                )}
                {user?.phone && (
                  <p className="mt-1 text-sm text-gray-600">
                    Phone: {user?.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Section */}
          <EditProfile user={user} />
        </div>
      </div>
    )
  );
};

export default Profile;
