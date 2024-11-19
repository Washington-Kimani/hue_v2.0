import { useState } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognitionHook.jsx";
import { FaMicrophoneAlt } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Main = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    const {
        text,
        isListening,
        startRecognition,
        stopRecognition,
        speakText,
        hasSpeechRecognition,
        isSpeaking,
    } = useSpeechRecognition();

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

    const sendMessage = async () => {
        stopRecognition();
        if (text.trim() === "") return;

        setLoading(true);
        try {
            const result = await model.generateContent(text);
            const responseText = result?.response || "Sorry, I couldn't process that.";
            console.log("AI Response:", responseText.text());

            setResponse(responseText.text());
            speakText(responseText.text()); // Speak immediately after setting response
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = "Sorry, something went wrong.";
            setResponse(errorMessage);
            speakText(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            {hasSpeechRecognition ? (
                <div className="main">
                    <div className="container text-center relative">
                        <div className="image-container">
                            <img src="/images/image.gif" alt={"H. U. E"} className="w-32 h-32 mx-auto" />
                        </div>
                        {isSpeaking && (
                            <img
                                src="/images/back.gif"
                                alt="Speaking Animation"
                                className="absolute left-1/2 top-[90%]  transform -translate-x-1/2 -translate-y-1/2 w-642 h-64 -z-10"
                            />
                        )}
                        <h1 className="text-2xl font-bold mt-2">H. U. E (v2.0)</h1>
                        <p className="text-gray-600">I am a virtual assistant</p>
                    </div>

                    <div className="mt-10 flex flex-col items-center space-y-4 bg-transparent">
                        <button
                            className={`btn ${
                                isListening ? "btn-stop" : "btn-start"
                            } flex items-center justify-center w-12 h-12 rounded-full shadow-lg`}
                            onClick={isListening ? stopRecognition : startRecognition}
                        >
                            <FaMicrophoneAlt className={`text-2xl ${isListening ? "text-red-500" : "text-blue-500"}`} />
                        </button>
                        <h1 className="content text-xl font-semibold text-gray-800">
                            {text || "Speak to me"}
                        </h1>
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className={`px-4 py-2 rounded bg-green-500 text-white ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? "Thinking..." : "Generate Response"}
                        </button>
                    </div>

                    {response && (
                        <div className="mt-4">
                            <h3 className="font-semibold">AI Response:</h3>
                            <p className="text-gray-700">{response}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <p>Speech Recognition is not available in your browser.</p>
                </div>
            )}
        </div>
    );
};

export default Main;