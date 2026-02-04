'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type ImagePileProps = {
    images: string[];
    speed?: number;
};

export function ImagePile({ images, speed = 2 }: ImagePileProps) {
    const [topIndex, setTopIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setTopIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, speed * 1000);

        return () => clearInterval(id);
    }, [images.length, speed]);

    return (
        <div className="relative h-[200px] sm:h-[260px] md:h-[390px] lg:h-[450px] xl:h-[500px] w-[310px] sm:w-[500px] md:w-[725px] lg:w-[900px] xl:w-[1200px] overflow-visible">
            {images.map((image, i) => {
                const isTop = topIndex === i;
                const secondTopIndex = (topIndex + 2) % images.length;
                const zIndex = isTop ? 100 : secondTopIndex ? 99 : images.length - i;
                const y: number = Math.random() * 20;
                const x: number = Math.random() * 20;
                const rotation = i * (Math.random() * 1 + 2) - 2;

                return (
                    <motion.div
                        key={`stacked-card-${i}`}
                        className="absolute w-full h-full"
                        style={{ zIndex, transformOrigin: 'center center' }}
                        animate={{
                            rotateZ: isTop ? 0 : rotation,
                            translateX: Math.random() < 0.5 ? x : -x,
                            opacity: isTop ? [0, 1] : 0.8,
                            translateY: isTop ? [30, Math.random() < 0.5 ? y : -y] : Math.random() < 0.5 ? y : -y,
                            transition: { duration: 0.5 }
                        }}
                        initial={isTop ? { rotateZ: 0 } : { rotateZ: rotation }}
                    >
                        <div className="relative h-full w-full overflow-hidden rounded-3xl">
                            <Image
                                src={image}
                                alt={`stacked-card-${i}`}
                                height={1080}
                                width={1920}
                                className="h-full w-full object-cover"
                                priority={isTop}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default ImagePile;
