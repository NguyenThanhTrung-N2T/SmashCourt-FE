"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Xin chào! Tôi là chatbot của SmashCourt. Tôi có thể giúp bạn tìm hiểu về hệ thống đặt sân cầu lông. Bạn cần hỗ trợ gì?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const QUICK_QUESTIONS = [
  "Làm thế nào để đặt sân?",
  "Chính sách hủy sân như thế nào?",
  "Có những chi nhánh nào?",
  "Làm sao để trở thành thành viên?",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("đặt sân") ||
      lowerQuestion.includes("booking")
    ) {
      return "Để đặt sân, bạn cần:\n1. Đăng ký tài khoản miễn phí\n2. Đăng nhập vào hệ thống\n3. Chọn chi nhánh và sân\n4. Chọn khung giờ trống\n5. Thanh toán online\n\nBạn có thể bắt đầu tại trang chủ hoặc liên hệ hotline 1900 9999 để được hỗ trợ!";
    }

    if (
      lowerQuestion.includes("chính sách") ||
      lowerQuestion.includes("hủy sân")
    ) {
      return "Chính sách hủy sân của chúng tôi rất minh bạch:\n• Hủy trước 24h: Hoàn 100%\n• Hủy trước 12h: Hoàn 50%\n• Hủy dưới 12h: Không hoàn tiền\n\nXem chi tiết tại trang Chính sách hoặc liên hệ hotline 1900 9999.";
    }

    if (
      lowerQuestion.includes("chi nhánh") ||
      lowerQuestion.includes("cơ sở")
    ) {
      return "Hiện tại SmashCourt có hơn 10 chi nhánh tại TP.HCM và các tỉnh lân cận. Mỗi chi nhánh có từ 3-8 sân cầu lông chất lượng cao.\n\nBạn có thể xem danh sách chi nhánh khi đăng nhập vào hệ thống hoặc liên hệ hotline 1900 9999.";
    }

    if (
      lowerQuestion.includes("thành viên") ||
      lowerQuestion.includes("membership")
    ) {
      return "Hệ thống thành viên của SmashCourt rất hấp dẫn:\n• Tích điểm mỗi lần đặt sân\n• Phân hạng: Bạc, Vàng, Kim cương\n• Ưu đãi giảm giá đặc biệt\n• Ưu tiên đặt sân giờ cao điểm\n\nĐăng ký tài khoản miễn phí ngay để bắt đầu tích điểm!";
    }

    if (
      lowerQuestion.includes("giá") ||
      lowerQuestion.includes("phí") ||
      lowerQuestion.includes("cost")
    ) {
      return "Giá sân cầu lông tại SmashCourt:\n• Giờ thường (6h-17h): 80.000-120.000đ/giờ\n• Giờ cao điểm (17h-22h): 120.000-180.000đ/giờ\n• Cuối tuần: 150.000-200.000đ/giờ\n\nGiá có thể khác nhau tùy chi nhánh. Xem giá chi tiết khi đặt sân!";
    }

    return "Cảm ơn bạn đã liên hệ! Tôi có thể hỗ trợ bạn về:\n• Cách đặt sân\n• Chính sách hủy sân\n• Thông tin chi nhánh\n• Hệ thống thành viên\n• Giá cả\n\nBạn muốn tìm hiểu về vấn đề nào? Hoặc liên hệ hotline 1900 9999 để được hỗ trợ trực tiếp.";
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-xl ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        aria-label="Mở chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex w-[380px] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "600px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-[2rem] bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">SmashCourt Chatbot</p>
              <p className="text-xs text-emerald-100">Hỗ trợ 24/7</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 hover:bg-white/20"
            aria-label="Đóng chatbot"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ minHeight: "300px", maxHeight: "400px" }}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === "bot" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          message.sender === "user"
                            ? "text-emerald-100"
                            : "text-slate-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="border-t border-slate-200 px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Câu hỏi thường gặp:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-200 px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
