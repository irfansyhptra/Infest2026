import { SVGProps } from "@/types/svgProps";
import React from "react";

export const Arrow = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "41"}
      height={props.height || "9"}
      viewBox="0 0 41 9"
      className={props.className}
    >
      <path
        d="M40.3536 4.85355C40.5488 4.65829 40.5488 4.34171 40.3536 4.14645L37.1716 0.964466C36.9763 0.769204 36.6597 0.769204 36.4645 0.964466C36.2692 1.15973 36.2692 1.47631 36.4645 1.67157L39.2929 4.5L36.4645 7.32843C36.2692 7.52369 36.2692 7.84027 36.4645 8.03553C36.6597 8.2308 36.9763 8.2308 37.1716 8.03553L40.3536 4.85355ZM0 5H40V4H0V5Z"
        fill="#FDECAE"
      />
    </svg>
  );
};
