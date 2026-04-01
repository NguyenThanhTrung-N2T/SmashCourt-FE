"use client";

import { useRef, useState } from "react";
import { BotMessageSquare, ChevronRight, ChevronUp, Sparkles, X } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Xin chào! Tôi là Smash AI Assistant. Tôi có thể giúp bạn tìm hiểu về hệ thống đặt sân cầu lông. Bạn cần hỗ trợ gì?",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    setTimeout(scrollToBottom, 50);

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
      setTimeout(scrollToBottom, 50);
    }, 1000);
  };

  const getBotResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("đặt sân") || lowerQuestion.includes("booking")) {
      return "Để đặt sân, bạn cần:\n1. Đăng ký tài khoản miễn phí\n2. Đăng nhập vào hệ thống\n3. Chọn chi nhánh và sân\n4. Chọn khung giờ trống\n5. Thanh toán online\n\nBạn có thể bắt đầu tại trang chủ hoặc liên hệ hotline 1900 9999 để được hỗ trợ!";
    }

    if (lowerQuestion.includes("chính sách") || lowerQuestion.includes("hủy sân")) {
      return "Chính sách hủy sân của chúng tôi rất minh bạch:\n• Hủy trước 24h: Hoàn 100%\n• Hủy trước 12h: Hoàn 50%\n• Hủy dưới 12h: Không hoàn tiền\n\nXem chi tiết tại trang Chính sách hoặc liên hệ hotline 1900 9999.";
    }

    if (lowerQuestion.includes("chi nhánh") || lowerQuestion.includes("cơ sở")) {
      return "Hiện tại SmashCourt có hơn 10 chi nhánh tại TP.HCM và các tỉnh lân cận. Mỗi chi nhánh có từ 3-8 sân cầu lông chất lượng cao.\n\nBạn có thể xem danh sách chi nhánh khi đăng nhập vào hệ thống hoặc liên hệ hotline 1900 9999.";
    }

    if (lowerQuestion.includes("thành viên") || lowerQuestion.includes("membership")) {
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
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed bottom-10 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-slate-900 to-emerald-900 text-white shadow-2xl shadow-slate-900/30 transition-all hover:scale-110 hover:shadow-emerald-500/30"
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:scale-110" />
        ) : (
          <>
            <BotMessageSquare className="h-7 w-7 transition-transform group-hover:scale-110" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-bold shadow-lg animate-pulse">
              1
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-32 right-6 z-[100] w-80 origin-bottom-right overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-all duration-300 sm:w-[380px] ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-50 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header - Matches CustomerHomeShell style */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Smash AI Assistant</h3>
              <p className="text-[11px] text-slate-400">Hỗ trợ 24/7</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full bg-white/10 p-1.5 text-white/50 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Đóng chatbot"
          >
            <ChevronUp className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex flex-col gap-4 overflow-y-auto bg-slate-50 p-5"
          style={{ height: "320px" }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" ? (
                <div className="flex max-w-[85%] items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                    <BotMessageSquare className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-700 shadow-sm">
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className="mt-1.5 text-[10px] text-slate-400">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-sm">
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="mt-1.5 text-[10px] text-slate-400 text-right">
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <BotMessageSquare className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
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
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Câu hỏi thường gặp
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-100 bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="relative"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi AI bất kỳ điều gì..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-5 pr-14 text-[14px] font-medium outline-none transition-colors focus:border-slate-900 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
