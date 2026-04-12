"use client";

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react";

import {
    StudentHomeCuteBear,
    type StudentHomeCuteBearReaction,
} from "@/components/student-home-cute-bear";
import { useStudentUserName } from "@/components/student-user-name-provider";
import { cn } from "@/lib/utils";

interface StudentHomeMascotProps {
    className?: string;
}

const reactionKeys = [
    "salsa-step",
    "hello-wave",
    "happy-bob",
] as const satisfies readonly StudentHomeCuteBearReaction[];
const defaultReactionKey = reactionKeys[0];
const reactionBubbleMessageTemplates = {
    "hello-wave": [
        "{name}, 오늘 출빠 하나요?",
        "{name}, 수업 출석 했나요?",
    ],
    "salsa-step": [
        "{name}, 쉐잇킷 쉐잇킷",
        "{name}, 원투쓰리~파이브식세븐~",
        "{name}, 왼오왼 오왼오",
        "{name}, 라이트턴~",
    ],
    "happy-bob": [
        "{name}, 저랑 홀딩해요",
        "{name}, 홀딩 100번 했나요?",
    ],
} as const satisfies Record<
    StudentHomeCuteBearReaction,
    readonly string[]
>;
const defaultBubbleMessage =
    reactionBubbleMessageTemplates[defaultReactionKey][0];

const reactionMotionDurationsMs: Record<StudentHomeCuteBearReaction, number> = {
    "salsa-step": 2400,
    "hello-wave": 4200,
    "happy-bob": 2400,
};
const reactionReducedDurationsMs: Record<StudentHomeCuteBearReaction, number> = {
    "salsa-step": 420,
    "hello-wave": 1080,
    "happy-bob": 420,
};
const bubbleDurationMs = 2600;
const bubbleEnterDurationMs = 220;
const bubbleExitDurationMs = 180;
const bubbleNineSliceSource = "/mascots/student-home/Union.svg";
const bubbleRightGutterPx = 12;
const bubbleShellMinWidthPx = 112;
const bubbleShellPreferredSingleLineMaxWidthPx = 132;
const bubbleShellPreferredTwoLineMaxWidthPx = 152;
const bubbleShellSingleLineHeightPx = 41;
const bubbleShellTwoLineHeightPx = 58;
const bubbleSingleLinePaddingLeftPx = 18;
const bubbleSingleLinePaddingRightPx = 16;
const bubbleTwoLinePaddingLeftPx = 18;
const bubbleTwoLinePaddingRightPx = 16;
const bubbleBorderTopPx = 8;
const bubbleBorderRightPx = 8;
const bubbleBorderBottomPx = 12;
const bubbleBorderLeftPx = 15;
const bubbleSliceTopPx = 50;
const bubbleSliceRightPx = 50;
const bubbleSliceBottomPx = 73;
const bubbleSliceLeftPx = 94;

type DanceState = "idle" | "dancing" | "reduced";
type BubblePhase = "hidden" | "entering" | "visible" | "exiting";
type BubbleWrapMode = "single-line" | "two-line";
type ReactionBubbleMessageIndexes = Record<StudentHomeCuteBearReaction, number>;

type AudioWindow = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

function getAudioContextConstructor() {
    if (typeof window === "undefined") {
        return null;
    }

    return (
        window.AudioContext ??
        (window as AudioWindow).webkitAudioContext ??
        null
    );
}

function playSalsaAccent(audioContext: AudioContext) {
    const pulses = [
        { at: 0, frequency: 420, gain: 0.035 },
        { at: 0.12, frequency: 560, gain: 0.028 },
        { at: 0.24, frequency: 710, gain: 0.024 },
    ];

    const startAt = audioContext.currentTime + 0.01;

    pulses.forEach((pulse, index) => {
        const oscillator = audioContext.createOscillator();
        const filter = audioContext.createBiquadFilter();
        const gainNode = audioContext.createGain();
        const pulseStart = startAt + pulse.at;

        oscillator.type = index === 1 ? "triangle" : "square";
        oscillator.frequency.setValueAtTime(pulse.frequency, pulseStart);
        oscillator.frequency.exponentialRampToValueAtTime(
            pulse.frequency * 1.28,
            pulseStart + 0.045,
        );

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(pulse.frequency * 1.4, pulseStart);
        filter.Q.setValueAtTime(1.2, pulseStart);

        gainNode.gain.setValueAtTime(0.0001, pulseStart);
        gainNode.gain.exponentialRampToValueAtTime(
            pulse.gain,
            pulseStart + 0.012,
        );
        gainNode.gain.exponentialRampToValueAtTime(0.0001, pulseStart + 0.11);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(pulseStart);
        oscillator.stop(pulseStart + 0.12);
    });
}

function getBubbleVisibleDurationMs(
    reactionKey: StudentHomeCuteBearReaction,
    prefersReducedMotion: boolean,
) {
    if (prefersReducedMotion) {
        return Math.max(
            1200,
            reactionReducedDurationsMs[reactionKey] + bubbleExitDurationMs + 80,
        );
    }

    return Math.max(
        bubbleDurationMs,
        reactionMotionDurationsMs[reactionKey] + bubbleExitDurationMs + 80,
    );
}

function shuffleReactionKeys(keys: readonly StudentHomeCuteBearReaction[]) {
    const nextKeys = [...keys];

    for (let index = nextKeys.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [nextKeys[index], nextKeys[randomIndex]] = [
            nextKeys[randomIndex],
            nextKeys[index],
        ];
    }

    return nextKeys;
}

function buildReactionQueue(
    previousReactionKey: StudentHomeCuteBearReaction | null,
) {
    const nextQueue = shuffleReactionKeys(reactionKeys);

    if (
        previousReactionKey &&
        nextQueue.length > 1 &&
        nextQueue[0] === previousReactionKey
    ) {
        [nextQueue[0], nextQueue[1]] = [nextQueue[1], nextQueue[0]];
    }

    return nextQueue;
}

function formatBubbleStudentName(studentUserName: string) {
    const trimmedName = studentUserName.trim();

    if (!trimmedName) {
        return "학생";
    }

    const firstNameToken = trimmedName.split(/\s+/)[0] ?? trimmedName;
    const nameGraphemes = Array.from(firstNameToken);

    if (nameGraphemes.length <= 8) {
        return firstNameToken;
    }

    return `${nameGraphemes.slice(0, 8).join("")}…`;
}

function pickReactionBubbleMessage(
    reactionKey: StudentHomeCuteBearReaction,
    bubbleStudentName: string,
    reactionBubbleMessageIndexes: ReactionBubbleMessageIndexes,
) {
    const bubbleTemplates = reactionBubbleMessageTemplates[reactionKey];
    const nextMessageIndex = reactionBubbleMessageIndexes[reactionKey] ?? 0;
    const nextBubbleTemplate =
        bubbleTemplates[nextMessageIndex % bubbleTemplates.length] ??
        defaultBubbleMessage;

    reactionBubbleMessageIndexes[reactionKey] =
        (nextMessageIndex + 1) % bubbleTemplates.length;

    return nextBubbleTemplate.replaceAll("{name}", bubbleStudentName);
}

export function StudentHomeMascot({ className }: StudentHomeMascotProps) {
    const studentUserName = useStudentUserName();
    const bubbleStudentName = formatBubbleStudentName(studentUserName);
    const [reactionKey, setReactionKey] =
        useState<StudentHomeCuteBearReaction | null>(null);
    const [bubbleMessageText, setBubbleMessageText] =
        useState<string>(() =>
            defaultBubbleMessage.replaceAll("{name}", bubbleStudentName),
        );
    const [bubblePhase, setBubblePhase] = useState<BubblePhase>("hidden");
    const [bubbleWrapMode, setBubbleWrapMode] =
        useState<BubbleWrapMode>("single-line");
    const [bubbleShellWidthPx, setBubbleShellWidthPx] =
        useState(bubbleShellMinWidthPx);
    const [bubbleShellHeightPx, setBubbleShellHeightPx] = useState(
        bubbleShellSingleLineHeightPx,
    );
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [isPoseActive, setIsPoseActive] = useState(false);
    const danceTimeoutRef = useRef<number | null>(null);
    const bubbleEnterTimeoutRef = useRef<number | null>(null);
    const bubbleExitTimeoutRef = useRef<number | null>(null);
    const bubbleHideTimeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const bubbleAnchorRef = useRef<HTMLDivElement | null>(null);
    const bubbleTextRef = useRef<HTMLSpanElement | null>(null);
    const reactionQueueRef = useRef<StudentHomeCuteBearReaction[]>([]);
    const reactionBubbleMessageIndexesRef = useRef<ReactionBubbleMessageIndexes>(
        {
            "salsa-step": 0,
            "hello-wave": 0,
            "happy-bob": 0,
        },
    );

    function clearBubbleTimers() {
        if (bubbleEnterTimeoutRef.current !== null) {
            window.clearTimeout(bubbleEnterTimeoutRef.current);
            bubbleEnterTimeoutRef.current = null;
        }
        if (bubbleExitTimeoutRef.current !== null) {
            window.clearTimeout(bubbleExitTimeoutRef.current);
            bubbleExitTimeoutRef.current = null;
        }
        if (bubbleHideTimeoutRef.current !== null) {
            window.clearTimeout(bubbleHideTimeoutRef.current);
            bubbleHideTimeoutRef.current = null;
        }
    }

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleChange = (event?: MediaQueryListEvent) => {
            setPrefersReducedMotion(event ? event.matches : media.matches);
        };

        handleChange();

        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handleChange);
        } else {
            media.addListener(handleChange);
        }

        return () => {
            if (danceTimeoutRef.current !== null) {
                window.clearTimeout(danceTimeoutRef.current);
            }
            clearBubbleTimers();
            if (audioContextRef.current) {
                void audioContextRef.current.close();
            }

            if (typeof media.removeEventListener === "function") {
                media.removeEventListener("change", handleChange);
            } else {
                media.removeListener(handleChange);
            }
        };
    }, []);

    function clearTimers() {
        if (danceTimeoutRef.current !== null) {
            window.clearTimeout(danceTimeoutRef.current);
            danceTimeoutRef.current = null;
        }
        clearBubbleTimers();
    }

    function pickNextReactionKey() {
        if (reactionQueueRef.current.length === 0) {
            reactionQueueRef.current = buildReactionQueue(reactionKey);
        }

        return reactionQueueRef.current.shift() ?? defaultReactionKey;
    }

    async function playTapSound() {
        const AudioContextCtor = getAudioContextConstructor();

        if (!AudioContextCtor) {
            return;
        }

        const audioContext = audioContextRef.current ?? new AudioContextCtor();
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        playSalsaAccent(audioContext);
    }

    function handleTap() {
        if (isDancing || isPoseActive) {
            return;
        }

        clearTimers();

        const nextReactionKey = pickNextReactionKey();
        const nextBubbleMessage = pickReactionBubbleMessage(
            nextReactionKey,
            bubbleStudentName,
            reactionBubbleMessageIndexesRef.current,
        );
        const nextReactionMotionDurationMs =
            reactionMotionDurationsMs[nextReactionKey];
        const nextReactionReducedDurationMs =
            reactionReducedDurationsMs[nextReactionKey];
        const nextBubbleDurationMs = getBubbleVisibleDurationMs(
            nextReactionKey,
            prefersReducedMotion,
        );

        setReactionKey(nextReactionKey);
        setBubbleMessageText(nextBubbleMessage);
        setBubbleWrapMode("single-line");
        setBubbleShellWidthPx(bubbleShellMinWidthPx);
        setBubbleShellHeightPx(bubbleShellSingleLineHeightPx);
        setBubblePhase(prefersReducedMotion ? "visible" : "entering");
        setIsPoseActive(true);
        setIsDancing(!prefersReducedMotion);

        if (!prefersReducedMotion) {
            void playTapSound();
        }

        if (!prefersReducedMotion) {
            bubbleEnterTimeoutRef.current = window.setTimeout(() => {
                setBubblePhase((current) =>
                    current === "entering" ? "visible" : current,
                );
                bubbleEnterTimeoutRef.current = null;
            }, bubbleEnterDurationMs);

            bubbleExitTimeoutRef.current = window.setTimeout(() => {
                setBubblePhase((current) =>
                    current === "hidden" ? "hidden" : "exiting",
                );
                bubbleExitTimeoutRef.current = null;
            }, nextBubbleDurationMs - bubbleExitDurationMs);
        }

        bubbleHideTimeoutRef.current = window.setTimeout(() => {
            setBubblePhase("hidden");
            bubbleHideTimeoutRef.current = null;
        }, nextBubbleDurationMs);

        danceTimeoutRef.current = window.setTimeout(
            () => {
                setIsDancing(false);
                setIsPoseActive(false);
                danceTimeoutRef.current = null;
            },
            prefersReducedMotion
                ? nextReactionReducedDurationMs
                : nextReactionMotionDurationMs,
        );
    }

    const activeReactionKey = reactionKey ?? defaultReactionKey;
    const currentReactionMotionDurationMs =
        reactionMotionDurationsMs[activeReactionKey];
    const currentReactionReducedDurationMs =
        reactionReducedDurationsMs[activeReactionKey];
    const danceState: DanceState = prefersReducedMotion
        ? isPoseActive
            ? "reduced"
            : "idle"
        : isDancing
          ? "dancing"
          : "idle";
    const isBubbleVisible = bubblePhase !== "hidden";

    useLayoutEffect(() => {
        if (!isBubbleVisible) {
            return;
        }

        const bubbleAnchor = bubbleAnchorRef.current;
        const bubbleText = bubbleTextRef.current;

        if (!bubbleAnchor || !bubbleText) {
            return;
        }

        const updateBubbleWrap = () => {
            const availableWidthPx = Math.max(
                window.innerWidth -
                    bubbleAnchor.getBoundingClientRect().left -
                    bubbleRightGutterPx,
                0,
            );
            const previousTextStyle = bubbleText.getAttribute("style");

            bubbleText.style.setProperty("display", "inline-block");
            bubbleText.style.setProperty("width", "auto");
            bubbleText.style.setProperty("max-width", "none");
            bubbleText.style.setProperty("white-space", "nowrap");
            bubbleText.style.setProperty("overflow", "visible");
            bubbleText.style.removeProperty("-webkit-line-clamp");
            bubbleText.style.removeProperty("-webkit-box-orient");

            const singleLineTextWidthPx =
                bubbleText.getBoundingClientRect().width;

            if (previousTextStyle === null) {
                bubbleText.removeAttribute("style");
            } else {
                bubbleText.setAttribute("style", previousTextStyle);
            }

            const naturalShellWidthPx = Math.max(
                bubbleShellMinWidthPx,
                Math.ceil(
                    singleLineTextWidthPx +
                        bubbleSingleLinePaddingLeftPx +
                        bubbleSingleLinePaddingRightPx,
                ),
            );
            const singleLineMaxWidthPx = Math.max(
                bubbleShellMinWidthPx,
                Math.min(
                    Math.floor(availableWidthPx),
                    bubbleShellPreferredSingleLineMaxWidthPx,
                ),
            );
            const shouldWrap = naturalShellWidthPx > singleLineMaxWidthPx;

            if (!shouldWrap) {
                setBubbleWrapMode((current) =>
                    current === "single-line" ? current : "single-line",
                );
                setBubbleShellWidthPx((current) =>
                    current === naturalShellWidthPx
                        ? current
                        : naturalShellWidthPx,
                );
                setBubbleShellHeightPx((current) =>
                    current === bubbleShellSingleLineHeightPx
                        ? current
                        : bubbleShellSingleLineHeightPx,
                );
                return;
            }

            const nextWidth = Math.max(
                bubbleShellMinWidthPx,
                Math.min(
                    Math.floor(availableWidthPx),
                    bubbleShellPreferredTwoLineMaxWidthPx,
                ),
            );

            if (previousTextStyle === null) {
                bubbleText.removeAttribute("style");
            } else {
                bubbleText.setAttribute("style", previousTextStyle);
            }

            setBubbleWrapMode((current) =>
                current === "two-line" ? current : "two-line",
            );
            setBubbleShellWidthPx((current) => {
                return current === nextWidth ? current : nextWidth;
            });
            setBubbleShellHeightPx((current) => {
                const nextHeight = bubbleShellTwoLineHeightPx;
                return current === nextHeight ? current : nextHeight;
            });
        };

        updateBubbleWrap();
        window.addEventListener("resize", updateBubbleWrap);

        return () => {
            window.removeEventListener("resize", updateBubbleWrap);
        };
    }, [bubbleMessageText, isBubbleVisible]);

    const mascotStyle = {
        width: "10.25rem",
        height: "9rem",
    } as CSSProperties & Record<string, string>;
    mascotStyle["--student-home-bubble-enter-duration"] =
        `${bubbleEnterDurationMs}ms`;
    mascotStyle["--student-home-bubble-exit-duration"] =
        `${bubbleExitDurationMs}ms`;
    mascotStyle["--student-home-stage-duration"] =
        `${currentReactionMotionDurationMs}ms`;
    mascotStyle["--student-home-stage-reduced-duration"] =
        `${currentReactionReducedDurationMs}ms`;
    mascotStyle["--student-home-sparkle-dance-duration"] =
        `${currentReactionMotionDurationMs}ms`;
    const bubbleShellStyle = {
        width: `${bubbleShellWidthPx / 16}rem`,
        height: `${bubbleShellHeightPx / 16}rem`,
        filter: "drop-shadow(0 4px 8px rgba(34, 28, 18, 0.05))",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderColor: "transparent",
        borderWidth: `${bubbleBorderTopPx}px ${bubbleBorderRightPx}px ${bubbleBorderBottomPx}px ${bubbleBorderLeftPx}px`,
        borderImageSource: `url("${bubbleNineSliceSource}")`,
        borderImageSlice: `${bubbleSliceTopPx} ${bubbleSliceRightPx} ${bubbleSliceBottomPx} ${bubbleSliceLeftPx} fill`,
        borderImageWidth: `${bubbleBorderTopPx}px ${bubbleBorderRightPx}px ${bubbleBorderBottomPx}px ${bubbleBorderLeftPx}px`,
        borderImageRepeat: "stretch",
    } as CSSProperties;

    return (
        <div
            className={cn(
                "relative flex max-w-full items-end justify-start",
                className,
            )}
            style={mascotStyle}
        >
            <div
                className="absolute bottom-1 rounded-full bg-[rgba(183,211,138,0.22)] blur-[8px]"
                style={{
                    left: "50%",
                    width: "7.4rem",
                    height: "1rem",
                    transform: "translateX(-50%)",
                }}
                aria-hidden="true"
            />
            <div
                className="absolute bottom-2 rounded-full bg-[rgba(255,248,230,0.52)] blur-lg"
                style={{
                    left: "50%",
                    width: "6.5rem",
                    height: "3.9rem",
                    transform: "translateX(-50%)",
                }}
                aria-hidden="true"
            />

            {isBubbleVisible ? (
                <div
                    ref={bubbleAnchorRef}
                    style={{ left: "calc(50% + 2.6rem)", top: "0.05rem" }}
                    className={cn(
                        "pointer-events-none absolute z-0",
                        !prefersReducedMotion &&
                            bubblePhase === "entering" &&
                            "student-home-mascot__bubble-shell--enter",
                        !prefersReducedMotion &&
                            bubblePhase === "exiting" &&
                            "student-home-mascot__bubble-shell--exit",
                    )}
                >
                    <div className="relative inline-block overflow-visible">
                        <div
                            data-slot="student-home-mascot-bubble"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            className="relative block overflow-visible"
                            style={bubbleShellStyle}
                        >
                            <div
                                className="absolute inset-0 text-[11px] font-semibold text-[#151515]"
                                style={{
                                    padding:
                                        bubbleWrapMode === "two-line"
                                            ? `${5 / 16}rem ${bubbleTwoLinePaddingRightPx / 16}rem ${9 / 16}rem ${bubbleTwoLinePaddingLeftPx / 16}rem`
                                            : `${4 / 16}rem ${bubbleSingleLinePaddingRightPx / 16}rem ${8 / 16}rem ${bubbleSingleLinePaddingLeftPx / 16}rem`,
                                }}
                            >
                                <span
                                    ref={bubbleTextRef}
                                    data-slot="student-home-mascot-bubble-text"
                                    className="block min-w-0 break-keep leading-[0.95rem] text-[#151515]"
                                    style={{
                                        display:
                                            bubbleWrapMode === "two-line"
                                                ? "-webkit-box"
                                                : "block",
                                        WebkitBoxOrient:
                                            bubbleWrapMode === "two-line"
                                                ? "vertical"
                                                : undefined,
                                        WebkitLineClamp:
                                            bubbleWrapMode === "two-line"
                                                ? 2
                                                : undefined,
                                        overflow:
                                            bubbleWrapMode === "two-line"
                                                ? "hidden"
                                                : "visible",
                                        whiteSpace:
                                            bubbleWrapMode === "two-line"
                                                ? "normal"
                                                : "nowrap",
                                        overflowWrap: "anywhere",
                                        wordBreak: "keep-all",
                                    }}
                                >
                                    {bubbleMessageText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <button
                type="button"
                onClick={handleTap}
                data-slot="student-home-mascot"
                data-dance-state={danceState}
                data-reaction-key={reactionKey ?? "idle"}
                aria-label="미니펫 상호작용"
                aria-pressed={danceState !== "idle"}
                className="group absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-end justify-center overflow-visible rounded-[1.9rem] bg-transparent transition-transform duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c766] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ width: "10.12rem", height: "12.76rem" }}
            >
                <span
                    className="absolute left-1/2 bottom-[0.35rem] -translate-x-1/2 rounded-full bg-[rgba(255,248,230,0.48)] blur-lg"
                    style={{ width: "6.8rem", height: "4.75rem" }}
                    aria-hidden="true"
                />
                <span
                    className="absolute inset-x-3 bottom-1 rounded-full bg-[rgba(157,191,93,0.14)] blur-md"
                    style={{ height: "0.9rem" }}
                    aria-hidden="true"
                />
                <span
                    className={cn(
                        "relative z-10 flex items-end justify-center overflow-visible",
                        !prefersReducedMotion && "student-home-mascot__stage",
                        isPoseActive &&
                            !prefersReducedMotion &&
                            "student-home-mascot__stage--active",
                        prefersReducedMotion &&
                            isPoseActive &&
                            "student-home-mascot__stage--reduced",
                    )}
                    style={{ width: "6.71rem", height: "9.735rem" }}
                    aria-hidden="true"
                >
                    <StudentHomeCuteBear
                        mode={danceState}
                        reaction={activeReactionKey}
                        motionEnabled={!prefersReducedMotion}
                        className="h-full w-full"
                    />
                </span>
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ffe8a7] shadow-[0_0_0_3px_rgba(255,225,124,0.14)]",
                        !prefersReducedMotion && "student-home-mascot__sparkle",
                        isPoseActive &&
                            !prefersReducedMotion &&
                            "student-home-mascot__sparkle--dancing",
                    )}
                />
            </button>

            <style jsx>{`
                .student-home-mascot__stage {
                    filter: drop-shadow(0 12px 18px rgba(132, 95, 39, 0.12));
                }

                .student-home-mascot__bubble-shell--enter {
                    transform-origin: 18% 88%;
                    animation: student-home-bubble-enter
                        var(--student-home-bubble-enter-duration) ease-out both;
                }

                .student-home-mascot__bubble-shell--exit {
                    transform-origin: 18% 88%;
                    animation: student-home-bubble-exit
                        var(--student-home-bubble-exit-duration) ease-in both;
                }

                .student-home-mascot__stage--active {
                    animation: student-home-stage-glow
                        var(--student-home-stage-duration)
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .student-home-mascot__stage--reduced {
                    animation: student-home-stage-reduced
                        var(--student-home-stage-reduced-duration)
                        cubic-bezier(0.25, 1, 0.5, 1);
                }

                .student-home-mascot__sparkle {
                    animation: student-home-sparkle 3.4s ease-in-out infinite;
                }

                .student-home-mascot__sparkle--dancing {
                    animation: student-home-sparkle-dance
                        var(--student-home-sparkle-dance-duration) ease-out;
                }

                @media (prefers-reduced-motion: reduce) {
                    .student-home-mascot__bubble-shell--enter,
                    .student-home-mascot__bubble-shell--exit,
                    .student-home-mascot__stage--active,
                    .student-home-mascot__stage--reduced,
                    .student-home-mascot__sparkle,
                    .student-home-mascot__sparkle--dancing {
                        animation: none !important;
                        transition: none !important;
                    }
                }

                @keyframes student-home-bubble-enter {
                    0% {
                        opacity: 0;
                        transform: translate(6px, 2px) scale(0.96);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(0, 0) scale(1);
                    }
                }

                @keyframes student-home-bubble-exit {
                    0% {
                        opacity: 1;
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(10px, 0) scale(0.98);
                    }
                }

                @keyframes student-home-stage-glow {
                    0% {
                        filter: drop-shadow(
                            0 12px 18px rgba(132, 95, 39, 0.12)
                        );
                    }
                    35% {
                        filter: drop-shadow(
                            0 16px 22px rgba(196, 124, 39, 0.18)
                        );
                    }
                    100% {
                        filter: drop-shadow(
                            0 12px 18px rgba(132, 95, 39, 0.12)
                        );
                    }
                }

                @keyframes student-home-stage-reduced {
                    0% {
                        filter: drop-shadow(
                            0 12px 18px rgba(132, 95, 39, 0.12)
                        );
                    }
                    55% {
                        filter: drop-shadow(
                            0 15px 20px rgba(196, 124, 39, 0.15)
                        );
                    }
                    100% {
                        filter: drop-shadow(
                            0 12px 18px rgba(132, 95, 39, 0.12)
                        );
                    }
                }

                @keyframes student-home-sparkle {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.82;
                    }
                    50% {
                        transform: scale(1.12);
                        opacity: 1;
                    }
                }

                @keyframes student-home-sparkle-dance {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.7;
                    }
                    40% {
                        transform: scale(1.35);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.9;
                    }
                }
            `}</style>
        </div>
    );
}
