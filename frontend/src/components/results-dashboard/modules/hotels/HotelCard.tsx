import { Hotel, Star, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HotelData {
    hotelId: string;
    name: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    price?: string;
    distance?: number;
}

export default function HotelCard({ hotel, isSelected, onClick, cityCode }: { hotel: HotelData, isSelected?: boolean, onClick?: () => void, cityCode?: string }) {
    const bookingLinks = [
        { name: 'MakeMyTrip', url: `https://www.makemytrip.com/hotels/hotel-search?city=${cityCode}&hotelName=${encodeURIComponent(hotel.name)}&searchText=${encodeURIComponent(hotel.name)}` },
        { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}` },
        { name: 'Goibibo', url: `https://www.goibibo.com/hotels/hotels-in-${cityCode}-ct/?searchText=${encodeURIComponent(hotel.name)}` },
        { name: 'Skyscanner', url: `https://www.skyscanner.net/hotels/search?q=${encodeURIComponent(hotel.name)}` },
    ];

    // Deterministic random placeholder image and price based on hotelId for visually distinct cards
    const hash = hotel.hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const photos = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
        "https://images.unsplash.com/photo-1551882547-ff40c0d5b5df?w=500&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
        "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?w=500&q=80",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=500&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80"
    ];
    const imageSrc = photos[hash % photos.length];

    return (
        <div
            onClick={onClick}
            className={`flex flex-col bg-[#1c2130] rounded-2xl overflow-hidden transition-all group cursor-pointer border ${isSelected ? 'border-emerald-500 shadow-emerald-500/20 shadow-lg' : 'border-black/20 hover:border-emerald-500/50 hover:shadow-xl'}`}
        >
            {/* Top Image Section */}
            <div className="relative h-48 w-full bg-gray-800">
                <img src={imageSrc} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Rating Badge - Only render if genuine rating exists */}
                {hotel.rating && (
                    <div className="absolute top-3 right-3 bg-[#151923]/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        <span className="text-white text-xs font-bold">{hotel.rating}</span>
                    </div>
                )}

                {/* Favorite Heart - Non-interactive until feature implemented */}
                <div className="absolute bottom-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 transition-colors" role="img" aria-label="Save hotel (Coming soon)">
                    <Heart className="w-4 h-4 text-white" />
                </div>
            </div>

            {/* Bottom Content Section */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2">
                        {hotel.name}
                    </h3>
                    {hotel.price && (
                        <div className="text-right flex-shrink-0">
                            <span className="text-lg font-bold text-white">${hotel.price}</span>
                            <span className="text-white/40 text-[10px] ml-1 uppercase">/night</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-white/50 text-xs mb-4 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">ID: {hotel.hotelId} {hotel.distance ? `• ${hotel.distance.toFixed(1)}km` : ''}</span>
                </div>

                <div className="mt-auto pt-2">
                    {isSelected ? (
                        <div className="grid grid-cols-2 gap-2">
                            {bookingLinks.map(link => (
                                <Button key={link.name} variant="outline" className="w-full text-xs h-10 bg-white/5 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-white/80 border-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); window.open(link.url, '_blank', 'noopener,noreferrer') }}>
                                    {link.name}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <Button className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                            View Deals
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
