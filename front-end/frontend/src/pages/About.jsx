import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetterBox from "../components/NewsLetterBox";

const About = () => {
  return (
    <div>
      <div className="pt-8 text-2xl text-center border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>
      <div className="flex flex-col gap-16 my-10 md:flex-row">
        <img
          className="w-full md:max-w-[450px]"
          src={assets.about_img}
          alt="About Photo"
        />
        <div className="flex flex-col justify-center gap-6 text-gray-600 md:w-2/4">
          <p>
            Welcome to Thook, where technology meets innovation. Our mission is to bring
            you the latest tablet technology and cutting-edge devices, all curated with
            an eye for performance and design. We believe that everyone deserves access to
            powerful, reliable tablets that enhance productivity and entertainment.
          </p>
          <p>
            At Thook, we prioritize your satisfaction. From the moment you
            browse our site to the day your tablet arrives, we are dedicated to
            providing a seamless shopping experience. Our team is always on the
            lookout for the latest technological advancements, ensuring that you have access to
            the most innovative tablets as soon as they hit the market.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            At Thook, our mission is to empower you with cutting-edge tablet technology
            that enhances your digital lifestyle. We strive to make premium tablets
            accessible to all, offering diverse options that inspire creativity and productivity.
          </p>
          <b className="text-gray-800">Our Vision</b>
          <p>
            At Thook, our vision is to be a global technology leader, known for
            cutting-edge tablet innovation and quality. We aim to inspire creativity and
            productivity, making Thook the go-to choice for digital excellence.
          </p>
        </div>
      </div>
      <div className="py-4 text-xl">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>
      <div className="flex flex-col mb-20 text-sm md:flex-row">
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Quality Assurance</b>
          <p className="text-gray-600">
            At Thook, quality comes first. Every tablet is carefully chosen and
            tested to meet our high standards. Shop with confidence, knowing
            we ensure excellence in every device.
          </p>
        </div>
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Convenience</b>
          <p className="text-gray-600">
            Thook ensures a smooth shopping experience with easy browsing, fast
            shipping, simple returns, and multiple payment options. Your comfort
            and satisfaction are our priorities.
          </p>
        </div>
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Exceptional Customer Service</b>
          <p className="text-gray-600">
            At Thook, exceptional service is our promise. Our dedicated support
            team is here to assist you with any questions or concerns, ensuring
            a smooth and satisfying shopping experience.
          </p>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  );
};

export default About;
