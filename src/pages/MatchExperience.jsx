import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

const experiencesByCity = {
  "Cusco": [
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
  ],
  "Lima": [
    {
      id: 10,
      title: "Cata de Ceviche Oculto",
      guide: "Chef Nómada",
      rating: 4.9,
      reviews: 312,
      price: 35,
      duration: "2.5 horas",
      groupSize: "1-4 personas",
      image: "https://images.unsplash.com/photo-1559055845-886d34e62810?w=800",
      description: "Recorre el mercado de Surquillo y degusta ceviche en un speakeasy gastronómico secreto."
    },
    {
      id: 11,
      title: "Surf en Costa Verde al Atardecer",
      guide: "Ola Swarm",
      rating: 4.7,
      reviews: 145,
      price: 25,
      duration: "3 horas",
      groupSize: "2-6 personas",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
      description: "Domina las olas del Pacífico con instructores locales mientras el sol cae sobre el mar."
    }
  ],
  "Puno": [
    {
      id: 20,
      title: "Noche en Isla Flotante de Totora",
      guide: "Uros Nativos",
      rating: 5.0,
      reviews: 98,
      price: 55,
      duration: "1 Noche",
      groupSize: "2 personas",
      image: "https://images.unsplash.com/photo-1542178652-320c89ba76bc?w=800",
      description: "Duerme bajo las estrellas en el Lago Titicaca sobre una isla ancestral tejida a mano."
    },
    {
      id: 21,
      title: "Kayak Místico al Amanecer",
      guide: "Titicaca Expeditions",
      rating: 4.8,
      reviews: 67,
      price: 20,
      duration: "2 horas",
      groupSize: "1-4 personas",
      image: "https://images.unsplash.com/photo-1534088568595-a066f410cbda?w=800",
      description: "Navega las aguas sagradas al amanecer rodeado de la inmensidad andina y silencio total."
    }
  ],
  "Arequipa": [
    {
      id: 30,
      title: "Trekking Cañón del Colca",
      guide: "Cóndor Andino",
      rating: 4.9,
      reviews: 412,
      price: 60,
      duration: "2 Días",
      groupSize: "4-8 personas",
      image: "https://images.unsplash.com/photo-1533221087851-bc2902347bde?w=800",
      description: "Desciende al segundo cañón más profundo del mundo y observa el vuelo majestuoso del cóndor."
    },
    {
      id: 31,
      title: "Ruta del Sillar Secreta",
      guide: "Roca Volcánica",
      rating: 4.8,
      reviews: 184,
      price: 25,
      duration: "4 horas",
      groupSize: "1-6 personas",
      image: "https://images.unsplash.com/photo-1549487965-4299b8e97a3a?w=800",
      description: "Explora las canteras de piedra volcánica blanca donde los canteros tallan la historia de la Ciudad Blanca."
    }
  ],
  "Iquitos": [
    {
      id: 40,
      title: "Expedición Selva Profunda",
      guide: "Amazonas Survival",
      rating: 4.9,
      reviews: 210,
      price: 120,
      duration: "3 Días",
      groupSize: "2-4 personas",
      image: "https://images.unsplash.com/photo-1517415413661-bc952ba5cbb9?w=800",
      description: "Adéntrate en la selva virgen del Amazonas, aprende supervivencia local y observa delfines rosados."
    },
    {
      id: 41,
      title: "Ceremonia de Sanación Mística",
      guide: "Espíritu Ancestral",
      rating: 4.7,
      reviews: 156,
      price: 80,
      duration: "1 Noche",
      groupSize: "1-2 personas",
      image: "https://images.unsplash.com/photo-1504626835614-256ef265f053?w=800",
      description: "Ceremonia de introspección con plantas maestras guiada por chamanes locales en medio de la selva."
    }
  ],
  "Nazca": [
    {
      id: 50,
      title: "Vuelo Privado Líneas de Nazca",
      guide: "Aero Geoglifos",
      rating: 4.9,
      reviews: 580,
      price: 90,
      duration: "1.5 horas",
      groupSize: "1-4 personas",
      image: "https://images.unsplash.com/photo-1628148858807-6bb9fdf0dbb6?w=800",
      description: "Sobrevuela el desierto en avioneta privada para descifrar los misteriosos geoglifos milenarios."
    },
    {
      id: 51,
      title: "Sandboard en Dunas de Usaca",
      guide: "Desert Riders",
      rating: 4.8,
      reviews: 132,
      price: 35,
      duration: "3 horas",
      groupSize: "2-8 personas",
      image: "https://images.unsplash.com/photo-1502307837336-d59cca9408a9?w=800",
      description: "Siente la adrenalina surfeando las dunas gigantes del desierto al atardecer en buggies."
    }
  ]
};

export default function MatchExperience() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // We extract city name, default to Cusco, but map Lima and Puno keywords if they appear
  const routeCity = location.state?.city?.name || "Cusco Backpackers";
  let cityKey = "Cusco";
  if (routeCity.includes("Lima")) cityKey = "Lima";
  else if (routeCity.includes("Lake Titicaca") || routeCity.includes("Puno")) cityKey = "Puno";
  else if (routeCity.includes("Arequipa")) cityKey = "Arequipa";
  else if (routeCity.includes("Amazon") || routeCity.includes("Iquitos")) cityKey = "Iquitos";
  else if (routeCity.includes("Nazca")) cityKey = "Nazca";
  
  const currentCityExperiences = experiencesByCity[cityKey] || experiencesByCity["Cusco"];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null); // 'left' or 'right'

  const currentExperience = currentCityExperiences[currentIndex];

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
        if (currentIndex < currentCityExperiences.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-background-light dark:bg-background-dark flex flex-col font-display text-slate-900 dark:text-white overflow-hidden relative transition-colors">
      {/* Header */}
      <PageHeader 
        title={`Descubrir: ${cityKey}`} 
        subtitle="Misiones"
        showBack={true}
        backTo="/map"
      />

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full relative px-6 py-4">
        <div 
          className={`w-full transition-all duration-300 transform ${
            direction === "left" ? "-translate-x-full -rotate-12 opacity-0" : 
            direction === "right" ? "translate-x-full rotate-12 opacity-0" : 
            "translate-x-0 rotate-0 opacity-100"
          }`}
        >
          <div className="bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
            {/* Image */}
            <div className="relative h-72 sm:h-80 bg-slate-200 dark:bg-slate-900">
              <img
                src={currentExperience.image}
                alt={currentExperience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-white px-4 py-2 rounded-full flex items-center gap-1 shadow-lg border border-slate-100 dark:border-slate-800">
                <span className="font-black text-primary">{currentExperience.price} XLM</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight leading-tight">{currentExperience.title}</h3>

              <div className="flex items-center gap-2 mb-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm">star</span>
                  <span className="text-slate-800 dark:text-white">{currentExperience.rating}</span>
                  <span className="text-slate-400 font-medium">
                    ({currentExperience.reviews})
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-800">•</span>
                <span className="text-primary uppercase tracking-wider">
                  {currentExperience.guide}
                </span>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                {currentExperience.description}
              </p>

              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="material-symbols-outlined text-sm text-accent">schedule</span>
                  <span>{currentExperience.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="material-symbols-outlined text-sm text-accent">group</span>
                  <span>{currentExperience.groupSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 justify-center max-w-md mx-auto w-full pb-8 z-10">
        <button
          onClick={() => handleSwipe(false)}
          className="w-16 h-16 rounded-full bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-850 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg text-slate-400 hover:text-red-500"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <button
          onClick={() => handleSwipe(true)}
          className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-primary/30 text-white"
        >
          <span className="material-symbols-outlined text-3xl">favorite</span>
        </button>
      </div>

      {/* Counter */}
      <div className="text-center pb-2 text-[10px] font-bold text-slate-400 tracking-widest z-10 uppercase">
        Misión {currentIndex + 1} de {currentCityExperiences.length}
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
