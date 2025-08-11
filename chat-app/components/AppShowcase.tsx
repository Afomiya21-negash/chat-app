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
    src: "/mobile-chat-dark.png",
    alt: "Chat Interface Screenshot 1",
    title: "Modern Chat Interface",
  },
  {
    id: 2,
    src: "/messaging-app-sidebar.png",
    alt: "Chat Interface Screenshot 2",
    title: "Organized Conversations",
  },
  {
    id: 3,
    src: "/group-chat-mobile-app.png",
    alt: "Chat Interface Screenshot 3",
    title: "Group Messaging",
  },
  {
    id: 4,
    src: "/chat-app-profile.png",
    alt: "Chat Interface Screenshot 4",
    title: "User Profiles",
  },
]

export default function AppShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Experience ቡና ጠጡ</h2>
          <p className="text-xl text-gray-200">See how our app brings people together</p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="pb-12"
          >
            {showcaseImages.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="bg-white rounded-2xl p-4 shadow-2xl">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    width={300}
                    height={600}
                    className="w-full h-96 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-lg font-semibold text-center text-dark-800">{image.title}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
