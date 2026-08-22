import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "motion/react"
import "swiper/css";
import { useNavigate } from "react-router-dom";

import backgroundImg1 from "../../../assets/images/home-bg-slider-img1.jpg";
import backgroundImg2 from "../../../assets/images/home-bg-slider-img2.jpg";
import Button from "../../Common/Button"

const textVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.15 },
    },
};

const child = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Hero = () => {
    const navigate = useNavigate();
    return (
        <Swiper
            modules={[Autoplay]}
            loop={true}
            autoplay={{
                delay: 2000,
                disableOnInteraction: false
            }} slidesPerView={1}>

            <SwiperSlide>
                <div className="relative h-screen">
                    <img
                        src={backgroundImg1}
                        alt="img1"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>

                    <motion.div
                        variants={textVariants}
                        initial="hidden"
                        animate="show"
                        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
                    >
                        <motion.h3 variants={child} className="text-2xl md:text-3xl mb-4 font-mono">
                            Hello! You are welcome to
                        </motion.h3>
                        <motion.h1 variants={child} className="text-5xl md:text-7xl text-white tracking-widest leading-relaxed font-serif">
                            ApexFit
                        </motion.h1>
                        <motion.h2 variants={child} className="text-4xl md:text-6xl mt-2 tracking-widest font-serif">
                            Fitness Club
                        </motion.h2>

                        <motion.div variants={child} className='cursor-pointer pt-10'>
                            <Button variant="primary" onClick={() => navigate("/about")}>
                                LEARN MORE
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </SwiperSlide>

            <SwiperSlide>
                <div className="relative h-screen">
                    <img
                        src={backgroundImg2}
                        alt="img1"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>

                    <motion.div
                        variants={textVariants}
                        initial="hidden"
                        animate="show"
                        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
                    >
                        <motion.h3 variants={child} className="text-2xl md:text-3xl mb-4 font-mono">
                            Hello! You are welcome to
                        </motion.h3>
                        <motion.h1 variants={child} className="text-5xl md:text-7xl text-white tracking-widest leading-relaxed font-serif">
                            ApexFit
                        </motion.h1>
                        <motion.h2 variants={child} className="text-4xl md:text-6xl mt-2 tracking-widest font-serif">
                            Fitness Club
                        </motion.h2>

                        <motion.div variants={child} className='cursor-pointer pt-10'>
                            <Button variant="primary" onClick={() => navigate("/about")}>
                                LEARN MORE
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </SwiperSlide>
        </Swiper>
    )
}

export default Hero