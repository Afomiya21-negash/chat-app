export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Background pattern/gradient is handled by parent div */}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Welcome to <span className="text-blue-200">ቡና ጠጡ</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
          Connect with your friends and family through ቡና ጠጡ
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" className="btn-primary text-lg px-8 py-4">
            Get Started
          </a>
          <a href="/login" className="btn-secondary text-lg px-8 py-4">
            Login
          </a>
        </div>
      </div>
    </section>
  )
}
