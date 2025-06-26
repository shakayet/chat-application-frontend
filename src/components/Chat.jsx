import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import baseUrl from "../../config";

const Chat = () => {
  const [messageList, setMessageList] = useState([]);
  const userInfo = JSON.parse(localStorage.loginData);
  const [text, setText] = useState("");
  const { chatId } = useParams();
  const chatBottomRef = useRef(null); // 👇 for auto scroll

  const socket = useMemo(
    () =>
      io("/", {
        transports: ["websocket"],
        path: "/socket.io",
        withCredentials: true,
      }),
    []
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected on client:", socket.id);
      socket.emit("join", userInfo.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    const fetchMessages = async () => {
      const res = await baseUrl.get(`/message/${chatId}`);
      setMessageList(res.data);
    };
    fetchMessages();

    const receiveMessageHandler = (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessageList((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [chatId, socket, userInfo.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const handleSendMessage = () => {
    if (!text.trim()) return;

    const lastMsg = messageList.find((msg) => msg.senderId !== userInfo.id);
    const receiverId = lastMsg?.senderId;

    if (!receiverId) {
      alert("❌ Cannot determine receiver.");
      return;
    }

    const data = {
      chatId,
      senderId: userInfo.id,
      receiverId,
      text,
    };

    socket.emit("send_message", data);
    setText(""); // Clear input
  };

  return (
    <div className="">
      <div className="bg-indigo-500 h-14 rounded-t-lg p-2 flex items-center text-white font-semibold text-xl">
        Chat
      </div>
      <div className="p-4">
        <div className="h-[830px] overflow-y-scroll flex flex-col gap-2">
          {messageList.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId !== userInfo.id
                  ? "justify-start"
                  : "justify-end"
                }`}
            >
              <div
                className={`p-3 rounded-lg ${message.senderId !== userInfo.id
                    ? "bg-blue-200 text-left"
                    : "bg-green-200 text-right"
                  }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {/* 👇 Auto scroll target */}
          <div ref={chatBottomRef} />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={text}
            className="w-full border border-indigo-500 rounded-md h-12 p-2"
            placeholder="Enter message"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button
            className="bg-indigo-500 text-white px-5 py-3 rounded-md"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
