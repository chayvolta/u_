import { useEffect } from 'react';
import { X, Beer, Percent, Activity } from 'lucide-react';

export function ProductDetailModal({ product, onClose }) {
  // Manejar el cierre con la tecla Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const beer = product.beer_details;
  
  // Fallbacks en caso de que no haya características cargadas (o estén en null/?)
  const title = beer?.title || 'Cerveza Especial';
  const name = beer?.name || product.description || 'Cerveza de Catálogo';
  const text = beer?.text || 'Esta cerveza forma parte del catálogo exclusivo de la tienda. Visítanos o comunícate con nosotros para más detalles sobre disponibilidad e importación.';
  const abv = beer?.abv ? `${beer.abv}%` : 'N/D';
  const ml = beer?.ml ? `${beer.ml} ml` : 'N/D';
  const imgUrl = beer?.img;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Tarjeta del Producto */}
      <div
        className="relative w-full max-w-[620px] bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row text-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
          aria-label="Cerrar detalle"
        >
          <X size={16} />
        </button>

        {/* Columna de Imagen (Izquierda) */}
        <div className="relative w-full md:w-[240px] h-[240px] md:h-auto bg-neutral-950/40 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden flex-shrink-0">
          {/* Aura brillante detrás de la botella */}
          <div className="absolute w-36 h-36 rounded-full bg-euro-primary/10 blur-[40px] pointer-events-none" />

          {imgUrl ? (
            <img
              src={imgUrl}
              alt={name}
              className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] z-10 transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-500 z-10">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center text-euro-primary/40">
                <Beer size={32} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Imagen no disponible
              </span>
            </div>
          )}
        </div>

        {/* Columna de Información (Derecha) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
          <div className="space-y-4">
            {/* Badge de Estilo */}
            <div>
              <span className="inline-block text-[10px] font-extrabold tracking-wider bg-euro-primary/10 border border-euro-primary/30 px-2.5 py-1 rounded-full text-euro-primary uppercase">
                {title}
              </span>
            </div>

            {/* Nombre de la cerveza */}
            <h2 className="text-lg md:text-xl font-bold leading-tight tracking-tight text-white font-sans pr-4">
              {name}
            </h2>

            {/* Ficha técnica rápida */}
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Percent size={14} className="text-euro-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 font-medium leading-none">ABV</span>
                  <span className="text-white mt-0.5 leading-none">{abv}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Activity size={14} className="text-euro-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 font-medium leading-none">Contenido</span>
                  <span className="text-white mt-0.5 leading-none">{ml}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="pt-2">
              <h3 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 mb-1">
                Características y Notas
              </h3>
              <p className="text-xs md:text-[13px] leading-relaxed text-gray-300 font-normal">
                {text}
              </p>
            </div>
          </div>

          {/* Footer de la tarjeta */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end text-[11px] text-gray-400">
            <span className="flex items-center gap-1 font-bold text-euro-primary">
              <Beer size={12} />
              Eurocervezas Premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
