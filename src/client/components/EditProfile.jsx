import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();

  const validateForm = () => {
    setIsFormValid(firstName && lastName && photoUrl && age && gender && about);
  };

  useEffect(() => {
    validateForm();
  }, [firstName, lastName, photoUrl, age, gender, about]);

  const saveProfile = async () => {
    setError("");
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br bg-white-1000 rounded-3xl from-pink-100 to-pink-100 min-h-screen flex justify-center items-center p-4">
        <div className="bg-white shadow-xl rounded-3xl w-full max-w-2xl p-8 border border-pink-100">
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-8">
            Edit Your Profile
          </h2>

          <div className="space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={validateForm}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={validateForm}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Profile Photo Upload (Cloudinary) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>

              {photoUrl && (
                <div className="mb-2">
                  <img
                    src={photoUrl}
                    alt="Profile Preview"
                    className="h-24 w-24 object-cover rounded-full"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("image", file);

                  try {
                    const res = await axios.post(
                      `${BASE_URL}/upload/image`,
                      formData,
                      {
                        withCredentials: true,
                        headers: { "Content-Type": "multipart/form-data" },
                      }
                    );

                    setPhotoUrl(res.data.url);
                  } catch (err) {
                    console.error("Image upload failed:", err);
                    setError("Image upload failed");
                  }
                }}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={validateForm}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm rounded-2xl font-medium text-gray-700 mb-1">
                Gender
              </label>
              <input
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                onBlur={validateForm}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                onBlur={validateForm}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                rows="4"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={saveProfile}
                disabled={!isFormValid}
                className={`w-full py-2 px-4 rounded-2xl text-white font-medium transition duration-300 ${
                  isFormValid
                    ? "bg-pink-400 hover:bg-pink-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-5 py-2 rounded-lg shadow-lg z-50">
          ✅ Profile updated successfully.
        </div>
      )}
    </>
  );
};

export default EditProfile;
