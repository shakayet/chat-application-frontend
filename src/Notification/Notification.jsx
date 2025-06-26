import { useEffect, useState } from "react";
import io from "socket.io-client";

const NotificationTester = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = "6851d1fad529a30e34951e21"; // Replace this with the actual user ID

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      path: "/socket.io",
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("join", userId);
    });

    socket.on("receive_notification", (data) => {
      console.log("🔔 Notification received:", data);
      setNotifications((prev) => [data, ...prev]); // Show latest on top
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-600 text-center">
        🔔 Notification Tester
      </h1>

      {notifications.length === 0 ? (
        <p className="text-gray-600 mt-4 text-center">
          No notifications yet...
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-indigo-100 border border-indigo-300 text-indigo-800 px-4 py-3 rounded shadow-sm"
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationTester;
