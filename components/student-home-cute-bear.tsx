"use client";

import { cn } from "@/lib/utils";

export type StudentHomeCuteBearReaction =
    | "salsa-step"
    | "hello-wave"
    | "happy-bob";

interface StudentHomeCuteBearProps {
    className?: string;
    mode: "idle" | "dancing" | "reduced";
    reaction?: StudentHomeCuteBearReaction;
    motionEnabled?: boolean;
}

const furFill = "#FFFCF7";
const furStroke = "#DDD1B7";
const limbStroke = "#D7C7A7";
const helloWaveDurationMs = 4200;
const helloWaveReducedDurationMs = 1080;

export function StudentHomeCuteBear({
    className,
    mode,
    reaction = "salsa-step",
    motionEnabled = true,
}: StudentHomeCuteBearProps) {
    return (
        <div
            className={cn(
                "student-home-cute-bear relative h-full w-full overflow-visible",
                `student-home-cute-bear--${reaction}`,
                motionEnabled && "student-home-cute-bear--motion",
                mode === "dancing" && "student-home-cute-bear--dancing",
                mode === "reduced" && "student-home-cute-bear--reduced",
                className,
            )}
            aria-hidden="true"
        >
            <svg
                viewBox="0 -12 194 294"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="xMidYMax meet"
                overflow="visible"
                style={{ overflow: "visible" }}
            >
                <g className="student-home-cute-bear__shadow">
                    <path
                        d="M97 274.92C150.351 274.92 193.6 267.721 193.6 258.84C193.6 249.959 150.351 242.76 97 242.76C43.6493 242.76 0.400024 249.959 0.400024 258.84C0.400024 267.721 43.6493 274.92 97 274.92Z"
                        fill="black"
                        fillOpacity="0.06"
                    />
                </g>

                <g className="student-home-cute-bear__character">
                    <g className="student-home-cute-bear__ear student-home-cute-bear__ear--left">
                        <path
                            d="M56.75 41.76C67.8647 41.76 76.875 32.7609 76.875 21.66C76.875 10.5591 67.8647 1.56 56.75 1.56C45.6353 1.56 36.625 10.5591 36.625 21.66C36.625 32.7609 45.6353 41.76 56.75 41.76Z"
                            fill={furFill}
                            stroke={furStroke}
                            strokeWidth="2.2"
                        />
                        <path
                            d="M56.75 33.72C63.4188 33.72 68.825 28.3206 68.825 21.66C68.825 14.9994 63.4188 9.6 56.75 9.6C50.0811 9.6 44.675 14.9994 44.675 21.66C44.675 28.3206 50.0811 33.72 56.75 33.72Z"
                            fill="#FFD1D1"
                        />
                    </g>

                    <g className="student-home-cute-bear__ear student-home-cute-bear__ear--right">
                        <path
                            d="M137.25 41.76C148.365 41.76 157.375 32.7609 157.375 21.66C157.375 10.5591 148.365 1.56 137.25 1.56C126.135 1.56 117.125 10.5591 117.125 21.66C117.125 32.7609 126.135 41.76 137.25 41.76Z"
                            fill={furFill}
                            stroke={furStroke}
                            strokeWidth="2.2"
                        />
                        <path
                            d="M137.25 33.72C143.919 33.72 149.325 28.3206 149.325 21.66C149.325 14.9994 143.919 9.6 137.25 9.6C130.581 9.6 125.175 14.9994 125.175 21.66C125.175 28.3206 130.581 33.72 137.25 33.72Z"
                            fill="#FFD1D1"
                        />
                    </g>

                    <path
                        className="student-home-cute-bear__body"
                        d="M24.55 210.6C24.55 90 40.65 9.6 97 9.6C153.35 9.6 169.45 90 169.45 210.6C169.45 250.8 137.25 266.88 97 266.88C56.75 266.88 24.55 250.8 24.55 210.6Z"
                        fill={furFill}
                        stroke={furStroke}
                        strokeWidth="2.4"
                    />
                    <ellipse
                        cx="97"
                        cy="189"
                        rx="35"
                        ry="55"
                        fill="#FFF0DD"
                        opacity="0.72"
                    />

                    <g className="student-home-cute-bear__face">
                        <path
                            d="M68.825 107.688C74.16 107.688 78.485 103.368 78.485 98.04C78.485 92.7116 74.16 88.392 68.825 88.392C63.4899 88.392 59.165 92.7116 59.165 98.04C59.165 103.368 63.4899 107.688 68.825 107.688Z"
                            fill="#1A1A1A"
                        />
                        <path
                            d="M125.175 107.688C130.51 107.688 134.835 103.368 134.835 98.04C134.835 92.7116 130.51 88.392 125.175 88.392C119.84 88.392 115.515 92.7116 115.515 98.04C115.515 103.368 119.84 107.688 125.175 107.688Z"
                            fill="#1A1A1A"
                        />
                        <path
                            d="M72.045 98.04C73.8234 98.04 75.265 96.6001 75.265 94.824C75.265 93.0479 73.8234 91.608 72.045 91.608C70.2667 91.608 68.825 93.0479 68.825 94.824C68.825 96.6001 70.2667 98.04 72.045 98.04Z"
                            fill="white"
                            opacity="0.8"
                        />
                        <path
                            d="M128.395 98.04C130.173 98.04 131.615 96.6001 131.615 94.824C131.615 93.0479 130.173 91.608 128.395 91.608C126.617 91.608 125.175 93.0479 125.175 94.824C125.175 96.6001 126.617 98.04 128.395 98.04Z"
                            fill="white"
                            opacity="0.8"
                        />
                        <path
                            d="M100.22 94.02H93.78C90.2233 94.02 87.34 96.8997 87.34 100.452C87.34 104.004 90.2233 106.884 93.78 106.884H100.22C103.777 106.884 106.66 104.004 106.66 100.452C106.66 96.8997 103.777 94.02 100.22 94.02Z"
                            fill="#1A1A1A"
                        />
                        <path
                            d="M97 106.884V114.12M97 114.12C92.975 114.12 88.95 112.512 88.95 112.512M97 114.12C101.025 114.12 105.05 112.512 105.05 112.512"
                            stroke="#1A1A1A"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M52.725 136.632C60.7276 136.632 67.215 130.153 67.215 122.16C67.215 114.167 60.7276 107.688 52.725 107.688C44.7224 107.688 38.235 114.167 38.235 122.16C38.235 130.153 44.7224 136.632 52.725 136.632Z"
                            fill="#FFB7B7"
                            opacity="0.6"
                        />
                        <path
                            d="M141.275 136.632C149.278 136.632 155.765 130.153 155.765 122.16C155.765 114.167 149.278 107.688 141.275 107.688C133.272 107.688 126.785 114.167 126.785 122.16C126.785 130.153 133.272 136.632 141.275 136.632Z"
                            fill="#FFB7B7"
                            opacity="0.6"
                        />
                    </g>

                    <g className="student-home-cute-bear__arm student-home-cute-bear__arm--left">
                        <path
                            d="M26.965 146.104C14.89 146.104 6.83997 162.184 6.83997 190.324C6.83997 214.444 18.915 222.484 30.99 214.444C39.04 206.404 39.04 186.304 39.04 170.224C39.04 154.144 35.015 146.104 26.965 146.104Z"
                            fill={furFill}
                            stroke={limbStroke}
                            strokeWidth="1.8"
                        />
                    </g>

                    <g className="student-home-cute-bear__arm student-home-cute-bear__arm--right">
                        <g className="student-home-cute-bear__arm-wave student-home-cute-bear__arm-wave--right">
                            <path
                                d="M167.639 146.707C179.714 146.707 187.764 162.787 187.764 190.927C187.764 215.047 175.689 223.087 163.614 215.047C155.564 207.007 155.564 186.907 155.564 170.827C155.564 154.747 159.589 146.707 167.639 146.707Z"
                                fill={furFill}
                                stroke={limbStroke}
                                strokeWidth="1.8"
                            />
                        </g>
                    </g>

                    <g className="student-home-cute-bear__foot student-home-cute-bear__foot--left">
                        <path
                            d="M48.7 256.227C40.65 256.227 32.6 260.247 32.6 268.287C32.6 276.327 44.675 280.347 60.775 280.347C76.875 280.347 84.925 276.327 84.925 268.287C84.925 260.247 76.875 256.227 68.825 256.227C60.775 256.227 56.75 256.227 48.7 256.227Z"
                            fill={furFill}
                            stroke={limbStroke}
                            strokeWidth="1.8"
                        />
                        <path
                            d="M44.675 269.091C46.4533 269.091 47.895 267.651 47.895 265.875C47.895 264.099 46.4533 262.659 44.675 262.659C42.8966 262.659 41.455 264.099 41.455 265.875C41.455 267.651 42.8966 269.091 44.675 269.091Z"
                            fill="#FFD1D1"
                        />
                        <path
                            d="M58.36 268.287C60.5829 268.287 62.385 266.487 62.385 264.267C62.385 262.047 60.5829 260.247 58.36 260.247C56.137 260.247 54.335 262.047 54.335 264.267C54.335 266.487 56.137 268.287 58.36 268.287Z"
                            fill="#FFD1D1"
                        />
                        <path
                            d="M72.85 269.091C74.6284 269.091 76.07 267.651 76.07 265.875C76.07 264.099 74.6284 262.659 72.85 262.659C71.0716 262.659 69.63 264.099 69.63 265.875C69.63 267.651 71.0716 269.091 72.85 269.091Z"
                            fill="#FFD1D1"
                        />
                    </g>

                    <g className="student-home-cute-bear__foot student-home-cute-bear__foot--right">
                        <path
                            d="M145.3 256.227C153.35 256.227 161.4 260.247 161.4 268.287C161.4 276.327 149.325 280.347 133.225 280.347C117.125 280.347 109.075 276.327 109.075 268.287C109.075 260.247 117.125 256.227 125.175 256.227C133.225 256.227 137.25 256.227 145.3 256.227Z"
                            fill={furFill}
                            stroke={limbStroke}
                            strokeWidth="1.8"
                        />
                        <path
                            d="M149.325 269.091C151.103 269.091 152.545 267.651 152.545 265.875C152.545 264.099 151.103 262.659 149.325 262.659C147.547 262.659 146.105 264.099 146.105 265.875C146.105 267.651 147.547 269.091 149.325 269.091Z"
                            fill="#FFD1D1"
                        />
                        <path
                            d="M135.64 268.287C137.863 268.287 139.665 266.487 139.665 264.267C139.665 262.047 137.863 260.247 135.64 260.247C133.417 260.247 131.615 262.047 131.615 264.267C131.615 266.487 133.417 268.287 135.64 268.287Z"
                            fill="#FFD1D1"
                        />
                        <path
                            d="M121.15 269.091C122.928 269.091 124.37 267.651 124.37 265.875C124.37 264.099 122.928 262.659 121.15 262.659C119.372 262.659 117.93 264.099 117.93 265.875C117.93 267.651 119.372 269.091 121.15 269.091Z"
                            fill="#FFD1D1"
                        />
                    </g>
                </g>
            </svg>

            <style jsx>{`
                .student-home-cute-bear :global(svg) {
                    filter: drop-shadow(0 12px 18px rgba(170, 137, 79, 0.16));
                }

                .student-home-cute-bear__character {
                    transform-origin: 97px 174px;
                }

                .student-home-cute-bear__face {
                    transform-origin: 97px 104px;
                }

                .student-home-cute-bear__ear--left {
                    transform-origin: 56.75px 21.66px;
                }

                .student-home-cute-bear__ear--right {
                    transform-origin: 137.25px 21.66px;
                }

                .student-home-cute-bear__arm--left {
                    transform-origin: 26.965px 146.104px;
                }

                .student-home-cute-bear__arm--right {
                    transform-origin: 167.639px 146.707px;
                }

                .student-home-cute-bear__arm-wave--right {
                    transform-origin: 167.639px 153.707px;
                }

                .student-home-cute-bear__foot--left {
                    transform-origin: 58.36px 268.287px;
                }

                .student-home-cute-bear__foot--right {
                    transform-origin: 135.64px 268.287px;
                }

                .student-home-cute-bear__shadow {
                    transform-origin: 97px 258.84px;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__character {
                    animation: student-home-cute-bear-idle 4.6s
                        cubic-bezier(0.25, 1, 0.5, 1) infinite;
                }

                .student-home-cute-bear--motion .student-home-cute-bear__face {
                    animation: student-home-cute-bear-face-idle 4.6s ease-in-out
                        infinite;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__ear--left {
                    animation: student-home-cute-bear-ear-left-idle 4.6s
                        ease-in-out infinite;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__ear--right {
                    animation: student-home-cute-bear-ear-right-idle 4.6s
                        ease-in-out infinite;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__arm--left {
                    animation: student-home-cute-bear-arm-left-idle 4.6s
                        ease-in-out infinite;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__arm--right {
                    animation: student-home-cute-bear-arm-right-idle 4.6s
                        ease-in-out infinite;
                }

                .student-home-cute-bear--motion
                    .student-home-cute-bear__shadow {
                    animation: student-home-cute-bear-shadow-idle 4.6s
                        ease-in-out infinite;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__character {
                    animation: student-home-cute-bear-salsa-character 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__face {
                    animation: student-home-cute-bear-salsa-face 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__ear--left {
                    animation: student-home-cute-bear-salsa-ear-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__ear--right {
                    animation: student-home-cute-bear-salsa-ear-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__arm--left {
                    animation: student-home-cute-bear-salsa-arm-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__arm--right {
                    animation: student-home-cute-bear-salsa-arm-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__foot--left {
                    animation: student-home-cute-bear-salsa-foot-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__foot--right {
                    animation: student-home-cute-bear-salsa-foot-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__shadow {
                    animation: student-home-cute-bear-salsa-shadow 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__character {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__face {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__ear--left {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__ear--right {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__arm--left {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__arm--right {
                    transform-origin: 167.639px 153.707px;
                    animation: student-home-cute-bear-hello-arm-right
                        ${helloWaveDurationMs}ms linear;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__arm-wave--right {
                    animation: student-home-cute-bear-hello-arm-right-wave
                        ${helloWaveDurationMs}ms linear;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__foot--left {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__foot--right {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__shadow {
                    animation: none;
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__character {
                    animation: student-home-cute-bear-happy-character 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__face {
                    animation: student-home-cute-bear-happy-face 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__ear--left {
                    animation: student-home-cute-bear-happy-ear-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__ear--right {
                    animation: student-home-cute-bear-happy-ear-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__arm--left {
                    animation: student-home-cute-bear-happy-arm-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__arm--right {
                    animation: student-home-cute-bear-happy-arm-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__foot--left {
                    animation: student-home-cute-bear-happy-foot-left 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__foot--right {
                    animation: student-home-cute-bear-happy-foot-right 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--dancing.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__shadow {
                    animation: student-home-cute-bear-happy-shadow 2.4s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__character {
                    animation: student-home-cute-bear-salsa-reduced-character
                        420ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__arm--left {
                    animation: student-home-cute-bear-salsa-reduced-arm-left
                        420ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--salsa-step
                    .student-home-cute-bear__shadow {
                    animation: student-home-cute-bear-salsa-reduced-shadow 420ms
                        cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__character {
                    animation: none;
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__face {
                    animation: none;
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__arm--right {
                    transform-origin: 167.639px 153.707px;
                    animation: student-home-cute-bear-hello-reduced-arm-right
                        ${helloWaveReducedDurationMs}ms
                        cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--hello-wave
                    .student-home-cute-bear__shadow {
                    animation: none;
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__character {
                    animation: student-home-cute-bear-happy-reduced-character
                        420ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__face {
                    animation: student-home-cute-bear-happy-reduced-face 420ms
                        cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__arm--left {
                    animation: student-home-cute-bear-happy-reduced-arm-left
                        420ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__arm--right {
                    animation: student-home-cute-bear-happy-reduced-arm-right
                        420ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-cute-bear--reduced.student-home-cute-bear--happy-bob
                    .student-home-cute-bear__shadow {
                    animation: student-home-cute-bear-happy-reduced-shadow 420ms
                        cubic-bezier(0.25, 1, 0.5, 1);
                }

                @keyframes student-home-cute-bear-idle {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg) scale(1.008);
                    }
                    50% {
                        transform: translateY(-1px) rotate(-1deg) scale(1.015);
                    }
                }

                @keyframes student-home-cute-bear-face-idle {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-1px);
                    }
                }

                @keyframes student-home-cute-bear-ear-left-idle {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    50% {
                        transform: rotate(-3deg);
                    }
                }

                @keyframes student-home-cute-bear-ear-right-idle {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    50% {
                        transform: rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-arm-left-idle {
                    0%,
                    100% {
                        transform: rotate(2deg);
                    }
                    50% {
                        transform: rotate(7deg) translateY(-1px);
                    }
                }

                @keyframes student-home-cute-bear-arm-right-idle {
                    0%,
                    100% {
                        transform: rotate(-2deg);
                    }
                    50% {
                        transform: rotate(-6deg) translateY(-1px);
                    }
                }

                @keyframes student-home-cute-bear-shadow-idle {
                    0%,
                    100% {
                        transform: scaleX(1);
                        opacity: 0.88;
                    }
                    50% {
                        transform: scaleX(0.97);
                        opacity: 0.72;
                    }
                }

                @keyframes student-home-cute-bear-salsa-character {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1.01);
                    }
                    18% {
                        transform: translate(-3px, -1px) rotate(-4deg)
                            scale(1.02);
                    }
                    38% {
                        transform: translate(3px, -3px) rotate(4deg)
                            scale(1.022);
                    }
                    58% {
                        transform: translate(-3px, -2px) rotate(-3deg)
                            scale(1.02);
                    }
                    80% {
                        transform: translate(3px, -2px) rotate(3deg)
                            scale(1.022);
                    }
                    100% {
                        transform: translate(0, 0) rotate(0deg) scale(1.01);
                    }
                }

                @keyframes student-home-cute-bear-salsa-face {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    24% {
                        transform: translateY(-2px) scale(1.01);
                    }
                    52% {
                        transform: translateY(1px) scale(0.995);
                    }
                    82% {
                        transform: translateY(-1px) scale(1.005);
                    }
                }

                @keyframes student-home-cute-bear-salsa-ear-left {
                    0% {
                        transform: rotate(0deg);
                    }
                    28% {
                        transform: rotate(-7deg);
                    }
                    54% {
                        transform: rotate(3deg);
                    }
                    80% {
                        transform: rotate(-5deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-ear-right {
                    0% {
                        transform: rotate(0deg);
                    }
                    24% {
                        transform: rotate(7deg);
                    }
                    48% {
                        transform: rotate(-3deg);
                    }
                    76% {
                        transform: rotate(5deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-arm-left {
                    0% {
                        transform: rotate(3deg);
                    }
                    18% {
                        transform: rotate(-18deg) translate(-3px, -10px);
                    }
                    40% {
                        transform: rotate(12deg) translateY(-3px);
                    }
                    62% {
                        transform: rotate(-15deg) translate(-2px, -7px);
                    }
                    84% {
                        transform: rotate(10deg) translateY(-2px);
                    }
                    100% {
                        transform: rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-arm-right {
                    0% {
                        transform: rotate(-3deg);
                    }
                    22% {
                        transform: rotate(9deg) translate(2px, -5px);
                    }
                    46% {
                        transform: rotate(-12deg) translate(-1px, -2px);
                    }
                    72% {
                        transform: rotate(10deg) translate(1px, -4px);
                    }
                    100% {
                        transform: rotate(-3deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-foot-left {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    20% {
                        transform: translate(-2px, -5px) rotate(-5deg);
                    }
                    42% {
                        transform: translate(0, 0) rotate(1deg);
                    }
                    70% {
                        transform: translate(-2px, -4px) rotate(-4deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-foot-right {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    28% {
                        transform: translate(2px, -5px) rotate(5deg);
                    }
                    54% {
                        transform: translate(0, 0) rotate(-1deg);
                    }
                    82% {
                        transform: translate(2px, -4px) rotate(4deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-shadow {
                    0% {
                        transform: scaleX(1);
                        opacity: 0.86;
                    }
                    40% {
                        transform: scaleX(0.92);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scaleX(1);
                        opacity: 0.86;
                    }
                }

                @keyframes student-home-cute-bear-hello-character {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1.008);
                    }
                    16% {
                        transform: translate(1px, -1px) rotate(1deg) scale(1.01);
                    }
                    28% {
                        transform: translate(3px, -2px) rotate(2deg)
                            scale(1.013);
                    }
                    40% {
                        transform: translate(4px, -3px) rotate(3deg)
                            scale(1.015);
                    }
                    56% {
                        transform: translate(4px, -3px) rotate(2.6deg)
                            scale(1.015);
                    }
                    70% {
                        transform: translate(4px, -3px) rotate(3deg)
                            scale(1.015);
                    }
                    84% {
                        transform: translate(3px, -2px) rotate(2deg)
                            scale(1.012);
                    }
                    100% {
                        transform: translate(0, 0) rotate(0deg) scale(1.008);
                    }
                }

                @keyframes student-home-cute-bear-hello-face {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    20% {
                        transform: translate(1px, -1px) rotate(2deg);
                    }
                    34% {
                        transform: translate(1px, -2px) rotate(5deg);
                    }
                    56% {
                        transform: translate(2px, -2px) rotate(7deg);
                    }
                    70% {
                        transform: translate(2px, -2px) rotate(6deg);
                    }
                    84% {
                        transform: translate(1px, -1px) rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-ear-left {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    56% {
                        transform: rotate(-1deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-ear-right {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    34% {
                        transform: rotate(4deg);
                    }
                    56% {
                        transform: rotate(-3deg);
                    }
                    70% {
                        transform: rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-arm-left {
                    0%,
                    100% {
                        transform: rotate(2deg);
                    }
                    56% {
                        transform: rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-arm-right {
                    0% {
                        transform: rotate(-3deg);
                    }
                    14% {
                        transform: rotate(-120deg);
                    }
                    94% {
                        transform: rotate(-120deg);
                    }
                    100% {
                        transform: rotate(-3deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-arm-right-wave {
                    0%,
                    14% {
                        transform: rotate(0deg);
                    }
                    22% {
                        transform: rotate(0deg);
                    }
                    28% {
                        transform: rotate(26deg);
                    }
                    32% {
                        transform: rotate(26deg);
                    }
                    42% {
                        transform: rotate(0deg);
                    }
                    46% {
                        transform: rotate(0deg);
                    }
                    56% {
                        transform: rotate(26deg);
                    }
                    60% {
                        transform: rotate(26deg);
                    }
                    70% {
                        transform: rotate(0deg);
                    }
                    74% {
                        transform: rotate(0deg);
                    }
                    84% {
                        transform: rotate(26deg);
                    }
                    88% {
                        transform: rotate(26deg);
                    }
                    92% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-foot-left {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    56% {
                        transform: translate(-1px, -2px) rotate(-2deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-foot-right {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    42% {
                        transform: translate(1px, -2px) rotate(2deg);
                    }
                    68% {
                        transform: translate(1px, -2px) rotate(2deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-shadow {
                    0%,
                    100% {
                        transform: scaleX(1);
                        opacity: 0.84;
                    }
                    40% {
                        transform: scaleX(0.95);
                        opacity: 0.72;
                    }
                    58% {
                        transform: scaleX(0.93);
                        opacity: 0.66;
                    }
                    72% {
                        transform: scaleX(0.94);
                        opacity: 0.68;
                    }
                }

                @keyframes student-home-cute-bear-happy-character {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg) scale(1.01);
                    }
                    18% {
                        transform: translate(0, -4px) rotate(-1deg) scale(1.018);
                    }
                    40% {
                        transform: translate(1px, -1px) rotate(1deg)
                            scale(1.012);
                    }
                    62% {
                        transform: translate(0, -5px) rotate(-1deg) scale(1.02);
                    }
                    82% {
                        transform: translate(-1px, -1px) rotate(1deg)
                            scale(1.013);
                    }
                }

                @keyframes student-home-cute-bear-happy-face {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    20% {
                        transform: translateY(-2px) scale(1.01);
                    }
                    44% {
                        transform: translateY(1px) scale(0.995);
                    }
                    66% {
                        transform: translateY(-2px) scale(1.012);
                    }
                    84% {
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes student-home-cute-bear-happy-ear-left {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    20% {
                        transform: rotate(-5deg);
                    }
                    44% {
                        transform: rotate(2deg);
                    }
                    66% {
                        transform: rotate(-6deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-ear-right {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    20% {
                        transform: rotate(5deg);
                    }
                    44% {
                        transform: rotate(-2deg);
                    }
                    66% {
                        transform: rotate(6deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-arm-left {
                    0%,
                    100% {
                        transform: rotate(2deg);
                    }
                    18% {
                        transform: rotate(-8deg) translate(-2px, -6px);
                    }
                    42% {
                        transform: rotate(10deg) translateY(-2px);
                    }
                    66% {
                        transform: rotate(-6deg) translate(-1px, -5px);
                    }
                }

                @keyframes student-home-cute-bear-happy-arm-right {
                    0%,
                    100% {
                        transform: rotate(-2deg);
                    }
                    18% {
                        transform: rotate(8deg) translate(2px, -6px);
                    }
                    42% {
                        transform: rotate(-10deg) translateY(-2px);
                    }
                    66% {
                        transform: rotate(6deg) translate(1px, -5px);
                    }
                }

                @keyframes student-home-cute-bear-happy-foot-left {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    18% {
                        transform: translate(-1px, -4px) rotate(-4deg);
                    }
                    42% {
                        transform: translate(1px, -1px) rotate(2deg);
                    }
                    68% {
                        transform: translate(-1px, -3px) rotate(-3deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-foot-right {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    28% {
                        transform: translate(1px, -4px) rotate(4deg);
                    }
                    50% {
                        transform: translate(-1px, -1px) rotate(-2deg);
                    }
                    78% {
                        transform: translate(1px, -3px) rotate(3deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-shadow {
                    0%,
                    100% {
                        transform: scaleX(1);
                        opacity: 0.84;
                    }
                    20% {
                        transform: scaleX(0.92);
                        opacity: 0.62;
                    }
                    42% {
                        transform: scaleX(0.97);
                        opacity: 0.76;
                    }
                    66% {
                        transform: scaleX(0.91);
                        opacity: 0.6;
                    }
                }

                @keyframes student-home-cute-bear-salsa-reduced-character {
                    0% {
                        transform: translateY(0) scale(1.01);
                    }
                    55% {
                        transform: translate(-1px, -3px) rotate(-2deg)
                            scale(1.025);
                    }
                    100% {
                        transform: translateY(0) scale(1.01);
                    }
                }

                @keyframes student-home-cute-bear-salsa-reduced-arm-left {
                    0% {
                        transform: rotate(2deg);
                    }
                    55% {
                        transform: rotate(-8deg) translate(-1px, -5px);
                    }
                    100% {
                        transform: rotate(2deg);
                    }
                }

                @keyframes student-home-cute-bear-salsa-reduced-shadow {
                    0% {
                        transform: scaleX(1);
                        opacity: 0.86;
                    }
                    55% {
                        transform: scaleX(0.95);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scaleX(1);
                        opacity: 0.86;
                    }
                }

                @keyframes student-home-cute-bear-hello-reduced-character {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1.008);
                    }
                    58% {
                        transform: translate(4px, -3px) rotate(3deg)
                            scale(1.015);
                    }
                    100% {
                        transform: translate(0, 0) rotate(0deg) scale(1.008);
                    }
                }

                @keyframes student-home-cute-bear-hello-reduced-face {
                    0% {
                        transform: rotate(0deg);
                    }
                    58% {
                        transform: translate(2px, -2px) rotate(7deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-reduced-arm-right {
                    0% {
                        transform: rotate(-3deg);
                    }
                    14% {
                        transform: rotate(-120deg);
                    }
                    94% {
                        transform: rotate(-120deg);
                    }
                    100% {
                        transform: rotate(-3deg);
                    }
                }

                @keyframes student-home-cute-bear-hello-reduced-shadow {
                    0%,
                    100% {
                        transform: scaleX(1);
                        opacity: 0.84;
                    }
                    55% {
                        transform: scaleX(0.96);
                        opacity: 0.72;
                    }
                }

                @keyframes student-home-cute-bear-happy-reduced-character {
                    0% {
                        transform: translateY(0) scale(1.01);
                    }
                    55% {
                        transform: translateY(-3px) scale(1.024);
                    }
                    100% {
                        transform: translateY(0) scale(1.01);
                    }
                }

                @keyframes student-home-cute-bear-happy-reduced-face {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    55% {
                        transform: translateY(-1px) scale(1.01);
                    }
                }

                @keyframes student-home-cute-bear-happy-reduced-arm-left {
                    0% {
                        transform: rotate(2deg);
                    }
                    55% {
                        transform: rotate(-5deg) translate(-1px, -3px);
                    }
                    100% {
                        transform: rotate(2deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-reduced-arm-right {
                    0% {
                        transform: rotate(-2deg);
                    }
                    55% {
                        transform: rotate(5deg) translate(1px, -3px);
                    }
                    100% {
                        transform: rotate(-2deg);
                    }
                }

                @keyframes student-home-cute-bear-happy-reduced-shadow {
                    0%,
                    100% {
                        transform: scaleX(1);
                        opacity: 0.84;
                    }
                    55% {
                        transform: scaleX(0.94);
                        opacity: 0.68;
                    }
                }
            `}</style>
        </div>
    );
}
