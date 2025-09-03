"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import Image from "next/image"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const showcaseImages = [
  {
    id: 1,
    src: "/images/chat-app 1.png",
    alt: "Chat Interface Screenshot 1",
    title: "Modern Chat Interface",
  },
  {
    id: 2,
    src: "/images/chat-app 3.png",
    alt: "Chat Interface Screenshot 2",
    title: "Organized Conversations",
  },
  {
    id: 3,
    src: "/images/chat-app 2.png",
    alt: "Chat Interface Screenshot 3",
    title: "Profile section ",
  },

]

export default function AppShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Experience ቡና ጠጡ</h2>
          <p className="text-xl text-gray-200">See how our app brings people together</p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            className="pb-12"
          >
            {showcaseImages.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    width={1280}
                    height={720}
                    className="w-full h-[520px] md:h-[640px] object-contain rounded-xl bg-black"
                  />
                  <h3 className="text-lg font-semibold text-center text-gray-100 mt-4">{image.title}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
