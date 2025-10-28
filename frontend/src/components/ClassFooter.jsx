import React, { useState } from "react";

{/* 
  CLASSFOOTER.JSX:
  The component showing a delete or leave class UI displays:
    - For teachers: delete class button
    - For students: leave class button
    - Confirmation on button press
*/}

// Takes functions onDeleteClass and onLeaveClass as arguments
export default function ClassFooter({ isTeacher, onDeleteClass, onLeaveClass }) {
  const [confirming, setConfirming] = useState(false);

  // Show confirmation if the button is pressed
  const handleClick = () => setConfirming(true);
  const handleCancel = () => setConfirming(false);

  // On confirm, delete or leave class
  const handleConfirm = () => {
    if (isTeacher && onDeleteClass) onDeleteClass();
    if (!isTeacher && onLeaveClass) onLeaveClass();
    setConfirming(false);
  };

  return (
    <div className="w-full flex justify-center mt-6">
      {!confirming && (
        // Button with delete or leave class
        <button
          className={`px-6 py-2 rounded-xl text-white ${
            isTeacher ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
          }`}
          onClick={handleClick}
        >
          {isTeacher ? "Delete Class" : "Leave Class"}
        </button>
      )}

      {/* On button press, show confirm and cancel buttons */}
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