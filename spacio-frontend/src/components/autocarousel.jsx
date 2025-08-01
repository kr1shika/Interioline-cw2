import { useEffect, useRef } from "react";
import img1 from "../assets/images/img1.png";
import img2 from "../assets/images/img2.png";
import img3 from "../assets/images/img3.png";
import img4 from "../assets/images/img4.png";
import img5 from "../assets/images/img5.png";

const images = [img1, img2, img3, img4, img5];

const AutoCarousel = () => {
    const containerRef = useRef(null);

    // Clone array twice so it loops naturally
    const loopedImages = [...images, ...images];

    useEffect(() => {
        const container = containerRef.current;

        let scrollAmount = 0;
        const imageWidth = container.scrollWidth / loopedImages.length;
        const scrollSpeed = 0.3; // pixels per frame

        const animate = () => {
            if (container) {
                scrollAmount += scrollSpeed;
                if (scrollAmount >= container.scrollWidth / 2) {
                    scrollAmount = 0; // reset to start (half = original set)
                }
                container.scrollLeft = scrollAmount;
            }
            requestAnimationFrame(animate);
        };

        animate();
    }, [loopedImages.length]);

    return (
        <div
            style={{
                backgroundColor: "#C3C7B7",
                padding: "15px 20px",
                borderRadius: "12px",
                width: "90%",
                margin: "40px auto",
                overflow: "hidden",
            }}
        >
            <div
                ref={containerRef}
                style={{
                    display: "flex",
                    gap: "10px",
                    overflow: "hidden",
                    scrollBehavior: "auto",
                    whiteSpace: "nowrap",
                }}
            >
                {loopedImages.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        alt={`carousel-${i}`}
                        style={{
                            height: "160px",
                            width: "20%",
                            flexShrink: 0,
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AutoCarousel;
