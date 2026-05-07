import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const experiences = [
  {
    id: 1,
    title: "Camino Inca Secreto",
    guide: "Pachacutec Tours",
    rating: 4.9,
    reviews: 127,
    price: 45,
    duration: "6 horas",
    groupSize: "2-8 personas",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
    description: "Ruta ancestral por andenes incas y templos ceremoniales ocultos",
  },
  {
    id: 2,
    title: "Ceremonia de Pago a la Tierra",
    guide: "Willka Shamanes",
    rating: 5.0,
    reviews: 89,
    price: 30,
    duration: "3 horas",
    groupSize: "1-6 personas",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
    description: "Ritual andino guiado por sabios locales en montaña sagrada",
  },
  {
    id: 3,
    title: "Mercado y Cocina Ancestral",
    guide: "Mama Qocha",
    rating: 4.8,
    reviews: 203,
    price: 28,
    duration: "5 horas",
    groupSize: "2-8 personas",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    description: "Aprende recetas pre-colombinas con ingredientes del mercado local",
  },
];

export default function MatchExperience() {
  const navigate = useNavigate();
  const location = useLocation();
  const city = location.state?.city?.name || "Cusco";
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null); // 'left' or 'right'

  const currentExperience = experiences[currentIndex];

  const handleSwipe = (liked) => {
    setDirection(liked ? "right" : "left");

    if (liked) {
      setTimeout(() => {
        navigate("/payment", { state: { swarm: {
          name: currentExperience.title,
          type: "Adventure",
          guide: currentExperience.guide,
          price: currentExperience.price
        }} });
      }, 500);
    } else {
      setTimeout(() => {
        setDirection(null);
        if (currentIndex < experiences.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col font-display text-slate-900 dark:text-white overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10">
        <button onClick={() => navigate("/map")} className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Mapa
        </button>
        <h2 className="text-lg font-bold tracking-tight">Descubrir: {city}</h2>
        <div className="w-16" />
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full relative">
        <div 
          className={`w-full transition-all duration-300 transform ${
            direction === "left" ? "-translate-x-full -rotate-12 opacity-0" : 
            direction === "right" ? "translate-x-full rotate-12 opacity-0" : 
            "translate-x-0 rotate-0 opacity-100"
          }`}
        >
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Image */}
            <div className="relative h-80 bg-slate-200 dark:bg-slate-900">
              <img
                src={currentExperience.image}
                alt={currentExperience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <span className="font-bold">{currentExperience.price} XLM</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">{currentExperience.title}</h3>

              <div className="flex items-center gap-2 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                  <span className="font-bold">{currentExperience.rating}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    ({currentExperience.reviews})
                  </span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500 font-medium">
                  {currentExperience.guide}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {currentExperience.description}
              </p>

              <div className="flex gap-4 mb-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{currentExperience.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>{currentExperience.groupSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 justify-center mt-6 max-w-md mx-auto w-full pb-8 z-10">
        <button
          onClick={() => handleSwipe(false)}
          className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
        >
          <span className="material-symbols-outlined text-3xl text-red-500">close</span>
        </button>
        <button
          onClick={() => handleSwipe(true)}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.4)]"
        >
          <span className="material-symbols-outlined text-4xl text-white">favorite</span>
        </button>
      </div>

      {/* Counter */}
      <div className="text-center mt-auto text-sm font-bold text-slate-400 tracking-widest z-10">
        {currentIndex + 1} / {experiences.length}
      </div>
    </div>
  );
}
