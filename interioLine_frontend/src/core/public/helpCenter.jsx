import { useState } from "react";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import "../style/HelpCenter.css";

const faqs = [
    {
        question: "How do I start a project as a client?",
        answer: "You can start a project by signing up, logging in, and selecting 'Start a New Project' on your dashboard."
    },
    {
        question: "What should I include in my room description and photos?",
        answer: "Include clear photos of your room from multiple angles, dimensions, existing furniture, and a brief about your style and goals."
    },
    {
        question: "How many times can I request revisions to my design?",
        answer: "You can request up to three revisions during the project. After that, additional revisions may incur a fee."
    },
    {
        question: "Do I have to take the style quiz to use InterioLine?",
        answer: "No, but we highly recommend it to help our designers better understand your preferences."
    },
    {
        question: "How do payments work during the project?",
        answer: "Payments are handled securely through our platform. You'll be charged when you accept a designer's proposal."
    },
    {
        question: "Can designers reject a project? What happens next?",
        answer: "Yes, designers can reject a project. If this happens, the project will be returned to the pool for another designer to pick."
    },
    {
        question: "How do I delete or pause my InterioLine account?",
        answer: "Go to Account Settings, then select 'Delete or Pause Account' and follow the on-screen instructions."
    },
    {
        question: "How do I start a project as a client?",
        answer: "Simply sign up, log in, and click on 'Start New Project'. Our system will guide you step-by-step."
    },
    {
        question: "How do I start a project as a client?",
        answer: "Just log in and click 'Start New Project'. Choose your preferences, upload your room photos, and you're ready!"
    }
];

export default function HelpCenter() {
    const [openIndex, setOpenIndex] = useState(null);
    const [showAuth, setShowAuth] = useState(false);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (

        <div style={{
            backgroundColor: " #FCFCEC",
            color: "#BE7B5D",
            minHeight: "100vh"
        }}>

            <Header onGetStartedClick={() => setShowAuth(true)} />

            <div className="faq-container">

                <h1 className="faq-title">FAQ</h1>

                {faqs.map((faq, index) => (
                    <div className="faq-item" key={index}>
                        <button
                            className={`faq-question ${openIndex === index ? "active" : ""}`}
                            onClick={() => toggleFAQ(index)}
                        >
                            {faq.question}
                        </button>
                        <div
                            className="faq-answer"
                            style={{
                                maxHeight: openIndex === index ? "200px" : "0",
                                padding: openIndex === index ? "12px 24px" : "0 24px"
                            }}
                        >
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />

        </div>
    );
}
