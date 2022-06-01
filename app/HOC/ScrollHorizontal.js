import React, { useEffect, useRef } from "react";

let isDown = false;
let startX;
let scrollLeft;

export const scrollHorizontal = (Component) => {
	return function ScrollHorizontal(props) {
		const scrollElement = useRef(null);

		useEffect(() => {
			if (scrollElement?.current) {
				const currentElmt = scrollElement.current;
				const elmt = currentElmt.childNodes[0];

				const handleSideButton = () => {
					const currentElmt = scrollElement.current;
					const elmt = currentElmt.childNodes[0];
					const maxScroll = elmt.scrollWidth - elmt.clientWidth;

					if (maxScroll <= 0) {
						scrollElement.current.classList.remove("horizntal-scroll-active-left");
						scrollElement.current.classList.remove("horizntal-scroll-active-right");
						return;
					}

					if (elmt.scrollLeft == 0) {
						scrollElement.current.classList.add("horizntal-scroll-active-right");
						scrollElement.current.classList.remove("horizntal-scroll-active-left");
					} else if (elmt.scrollLeft == maxScroll) {
						scrollElement.current.classList.add("horizntal-scroll-active-left");
						scrollElement.current.classList.remove("horizntal-scroll-active-right");
					} else if (elmt.scrollLeft > 0 && elmt.scrollLeft < maxScroll) {
						scrollElement.current.classList.add("horizntal-scroll-active-left");
						scrollElement.current.classList.add("horizntal-scroll-active-right");
					}
				};

				handleSideButton();

				const handleMouseDown = (e) => {
					isDown = true;
					startX = e.pageX - elmt.offsetLeft;
					scrollLeft = elmt.scrollLeft;
				};

				const handleMouseLeave = () => {
					isDown = false;
				};

				const handleMouseUp = () => {
					isDown = false;
					elmt.classList.remove("horizntal-scroll__active");
				};

				const handleMouseMove = (e) => {
					if (!isDown) return;
					e.preventDefault();
					elmt.classList.add("horizntal-scroll__active");
					const x = e.pageX - elmt.offsetLeft;
					const walk = (x - startX) * 1;
					elmt.scrollLeft = scrollLeft - walk;

					handleSideButton();
				};

				elmt.addEventListener("mousedown", handleMouseDown);
				elmt.addEventListener("mouseleave", handleMouseLeave);
				elmt.addEventListener("mouseup", handleMouseUp);
				elmt.addEventListener("mousemove", handleMouseMove);
				window.addEventListener("resize", handleSideButton);

				return () => {
					elmt.removeEventListener("mousedown", handleMouseDown);
					elmt.removeEventListener("mouseleave", handleMouseLeave);
					elmt.removeEventListener("mouseup", handleMouseUp);
					elmt.removeEventListener("mousemove", handleMouseMove);
					window.removeEventListener("resize", handleSideButton);
				};
			}
		}, [scrollElement, Component, isDown, startX, scrollLeft]);

		return (
			<div ref={scrollElement} className="horizntal-scroll">
				<Component {...props} />
			</div>
		);
	}
};
