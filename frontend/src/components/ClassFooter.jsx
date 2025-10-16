import React, { useState } from "react";

export default function ClassFooter({ isTeacher, onDeleteClass, onLeaveClass }) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => setConfirming(true);
  const handleCancel = () => setConfirming(false);

  const handleConfirm = () => {
    if (isTeacher && onDeleteClass) onDeleteClass();
    if (!isTeacher && onLeaveClass) onLeaveClass();
    setConfirming(false);
  };

  return (
    <div className="w-full flex justify-center mt-6">
      {!confirming && (
        <button
          className={`px-6 py-2 rounded-xl text-white ${
            isTeacher ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
          }`}
          onClick={handleClick}
        >
          {isTeacher ? "Delete Class" : "Leave Class"}
        </button>
      )}

      {confirming && (
        <div className="flex flex-col items-center gap-2">
          <p>Are you sure?</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-xl"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-white ${
                isTeacher ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}