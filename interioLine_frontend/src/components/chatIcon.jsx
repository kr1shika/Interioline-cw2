import { useEffect, useRef, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import ChatWidget from "../core/private/chat";

export default function ChatIconWithWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();

    const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                className="icon-button"
                title="Messages"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <FaEnvelope className="navicon" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 z-50">
                    <ChatWidget />
                </div>
            )}
        </div>
    );
}
