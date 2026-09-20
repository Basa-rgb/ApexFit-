import React from 'react'
import AboutImg from "../../../assets/images/about.png";
import { Link } from "react-router-dom";
import { Dumbbell, Trophy, Users } from "lucide-react";
const AboutSection = () => {
    return (
        <section className='bg-[#F2F2F2]'>

            <div className="flex flex-col justify-center items-center gap-2 px-4 py-8 md:py-10">
                <h1 className=' text-gray-500 font-serif font-bold sm:text-3xl md:text-4xl text-center'>ABOUT APEXFIT</h1>
                <p className='text-lg font-semibold  text-gray-500'> More Than a Gym</p>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px6 lg:px-8'>

                <div className='grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center'>

                    {/* left side content  */}


                    <div className="w-full h-[350px] sm:h-[400px] lg:h-[500px]">
                        <img src={AboutImg} alt="about img"
                            className='w-full h-full object-cover rounded-2xl shadow-md shadow-red-500' />
                    </div>

                    {/* Right side content */}

                    <div className='max-w-xl flex flex-col justify-center  gap-6'>
                        <h2 className=" flex justify-center items-center font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-gray-500">
                            About Us
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base leading-7 sm:leading-8 text-justify">ApexFit is a modern fitness club built to help
                            you become stronger, healthier, and more confident.
                            We believe fitness is not just about lifting weights
                            or changing your appearance—it's about building
                            discipline, improving your lifestyle, and becoming
                            the best version of yourself.
                            <br />
                            <br />

                            Whether you're just starting your fitness journey
                            or looking to take your training to the next level,
                            ApexFit provides the environment, equipment, and
                            guidance you need to reach your goals.</p>


                        {/* Button  */}
                        <div className='flex justify-center items-center p-4'>
                            <Link to="/blogs"
                                className='inline-block bg-[#26263A] text-white border-2 border-[#26253A] px-7 sm:px-10 py-3 font-serif tracking-wider text-lg transition-all duration-300 hover:bg-white hover:text-black '>LEARN MORE</Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* WHY CHOOSE APEXFIT? */}/



            <div className='flex  justify-center items-center gap-4  p-10'>
                <h1 className=' text-4xl text-gray-500 font-serif'>WHY CHOOSE APEXFIT ?</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 p-6">

                {/* Expert Trainers */}
                <div className="flex flex-col items-center text-center gap-3">
                    <Dumbbell
                        size={38}
                        strokeWidth={1.5}
                        className="text-[#26253A]"
                    />

                    <h3 className="font-serif font-bold text-lg">
                        Expert Trainers
                    </h3>

                    <p className="text-sm text-gray-500">
                        Professional guidance to help you reach your goals.
                    </p>
                </div>

                {/* Modern Gym */}
                <div className="flex flex-col items-center text-center gap-3">
                    <Trophy
                        size={38}
                        strokeWidth={1.5}
                        className="text-[#26253A]"
                    />

                    <h3 className="font-serif font-bold text-lg">
                        Modern Gym
                    </h3>

                    <p className="text-sm text-gray-500">
                        Quality equipment for effective workouts.
                    </p>
                </div>

                {/* Great Community */}
                <div className="flex flex-col items-center text-center gap-3">
                    <Users
                        size={38}
                        strokeWidth={1.5}
                        className="text-[#26253A]"
                    />

                    <h3 className="font-serif font-bold text-lg">
                        Great Community
                    </h3>

                    <p className="text-sm text-gray-500">
                        A motivating environment for everyone.
                    </p>
                </div>

            </div>

        </section>
    )
}

export default AboutSection