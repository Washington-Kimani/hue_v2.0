import { useEffect, useState, useRef } from "react";

const useSpeechRecognition = () => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const recognitionRef = useRef(null);

    useEffect(() => {
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = "en-GB";
            recognitionRef.current = recognition;
            setHasSpeechRecognition(true);
        } else {
            setHasSpeechRecognition(false);
        }
    }, []);

    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition || !isListening) return;

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join(" ");
            setText(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            stopRecognition(); // Safely stop listening
        };

        recognition.onend = () => {
            if (isListening) {
                try {
                    recognition.start(); // Restart recognition if still listening
                } catch (error) {
                    console.error("Error restarting recognition:", error);
                }
            }
        };

        return () => {
            recognition.stop();
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
        };
    }, [isListening]);

    const startRecognition = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        setText("");
        setIsListening(true);
    };

    const stopRecognition = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        setIsListening(false);
        try {
            recognition.stop();
        } catch (error) {
            console.error("Error stopping recognition:", error);
        }
    };

    const CHUNK_SIZE = 150; // Max characters per chunk (adjust as needed)

    const speakText = (textToSpeak) => {
        if (!("speechSynthesis" in window)) {
            console.error("Speech synthesis is not supported in this browser.");
            return;
        }

        const synth = window.speechSynthesis;
        if (synth.speaking) {
            console.warn("Speech synthesis already in progress. Stopping it.");
            synth.cancel(); // Stop ongoing speech
        }

        const chunks = textToSpeak.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")); // Split text into chunks

        let currentIndex = 0;

        const speakChunk = () => {
            if (currentIndex >= chunks.length) {
                setIsSpeaking(false); // All chunks spoken
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);

            // Retrieve all voices
            const voices = synth.getVoices();
            const britishVoice = voices.find((voice) =>
                voice.name.includes("UK") || voice.lang === "en-GB"
            );

            if (britishVoice) {
                utterance.voice = britishVoice;
            } else {
                console.warn("British voice not found, using default voice.");
            }
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                currentIndex += 1;
                speakChunk(); // Recursively speak the next chunk
            };

            utterance.onerror = (error) => {
                console.error("Speech synthesis error:", error);
                setIsSpeaking(false);
            };

            synth.speak(utterance);
        };

        setIsSpeaking(true);
        speakChunk();
    };

    return {
        text,
        isListening,
        startRecognition,
        stopRecognition,
        speakText,
        hasSpeechRecognition,
        isSpeaking,
    };
};

export default useSpeechRecognition;