import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const CHARS = "-_~`!@#$%^&* ()+=[]{ }|;:,.<>?/";

    interface TextScrambleProps {
        children: string;
    className?: string;
    trigger?: boolean;
}

    export const TextScramble = ({children, className = "", trigger = true}: TextScrambleProps) => {
    const [text, setText] = useState(children);
    const ref = useRef(null);
    const isInView = useInView(ref, {once: true });

    useEffect(() => {
        if (!trigger || !isInView) return;

    let iteration = 0;
    let interval: NodeJS.Timeout;

        interval = setInterval(() => {
        setText((_) =>
            children
                .split("")
                .map((_, index) => {
                    if (index < iteration) {
                        return children[index];
                    }
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
                .join("")
        );

            if (iteration >= children.length) {
        clearInterval(interval);
            }

    iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [children, trigger, isInView]);

    return (
    <span ref={ref} className={className}>
        {text}
    </span>
    );
};
