
import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../services/aiService';
import { CarePlace } from '../types';

const NearbyCareFinder: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLoc, setManualLoc] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [filterType, setFilterType] = useState<'Hospital' | 'Pharmacy' | 'Both'>('Both');
  const [radius, setRadius] = useState(5); // km
  const [places, setPlaces] = useState<CarePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    // Attempt to get location on mount
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setPermissionStatus('granted');
        },
        (err) => {
          console.warn("Geolocation denied/failed", err);
          setPermissionStatus('denied');
          setUseManual(true);
        }
      );
    } else {
      setUseManual(true);
    }
  }, []);

  const handleSearch = async () => {
    if (!coords && !manualLoc) return;
    
    setLoading(true);
    setError(null);
    setPlaces([]);

    try {
      const results = await findNearbyPlaces(
        coords?.lat || 0,
        coords?.lng || 0,
        filterType,
        radius,
        useManual ? manualLoc : undefined
      );

      setPlaces(results);
      if (results.length === 0) {
        setError("No places found nearby. Try increasing the radius or checking the location.");
      }
    } catch (err) {
      setError("Failed to fetch nearby places. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start">
              <span className="bg-red-500/20 text-red-400 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </span>
              Nearby Care Finder
            </h2>
            <p className="text-slate-400 max-w-2xl">
              Find hospitals, clinics, and pharmacies near you instantly using Google Maps data. 
              <br/><span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded ml-0.5">Privacy: Location is not stored.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              
              {/* Location Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-cyan-400 mb-2">Your Location</label>
                
                {!useManual && coords ? (
                  <div className="flex items-center justify-between bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 text-emerald-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span className="text-sm">Using Live GPS</span>
                    </div>
                    <button onClick={() => setUseManual(true)} className="text-xs underline hover:text-white">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                     <input 
                       type="text" 
                       value={manualLoc}
                       onChange={(e) => setManualLoc(e.target.value)}
                       placeholder="Enter City, Zip, or Landmark"
                       className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                     />
                     {permissionStatus === 'granted' && (
                       <button onClick={() => setUseManual(false)} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Use GPS instead
                       </button>
                     )}
                  </div>
                )}
              </div>

              {/* Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-cyan-400 mb-2">Looking For</label>
                <div className="flex bg-slate-800/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setFilterType('Hospital')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'Hospital' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Hospitals
                  </button>
                  <button 
                    onClick={() => setFilterType('Pharmacy')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'Pharmacy' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Pharmacy
                  </button>
                  <button 
                    onClick={() => setFilterType('Both')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'Both' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Radius Slider */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cyan-400 font-medium">Search Radius</span>
                  <span className="text-white font-bold">{radius} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1km</span>
                  <span>10km</span>
                  <span>20km</span>
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                disabled={loading || (!coords && !manualLoc)}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading || (!coords && !manualLoc)
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 transform hover:-translate-y-1'
                }`}
              >
                {loading ? 'Searching...' : 'Find Places'}
              </button>

            </div>
          </div>

          {/* RIGHT: Results List */}
          <div className="lg:col-span-8">
            {places.length > 0 ? (
              <div className="space-y-4">
                {places.map((place) => (
                  <div key={place.id} className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-xl p-5 transition-all animate-slideUp flex flex-col md:flex-row gap-4">
                    
                    {/* Icon & Distance */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[80px]">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        place.type.toLowerCase().includes('pharmacy') 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                         {place.type.toLowerCase().includes('pharmacy') ? (
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                           </svg>
                         )}
                      </div>
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-full">{place.distanceKm} km</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">{place.name}</h3>
                        {place.rating && (
                          <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
                            <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            {place.rating} ({place.userRatingsTotal || 0})
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-400 mb-2">{place.address}</p>
                      
                      {place.summary && (
                        <p className="text-sm text-cyan-200/80 italic mb-3">"{place.summary}"</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4">
                        {place.isOpenNow !== undefined && (
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${place.isOpenNow ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {place.isOpenNow ? 'OPEN NOW' : 'CLOSED'}
                          </span>
                        )}
                        {place.phoneNumber && (
                          <a href={`tel:${place.phoneNumber}`} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center transition-colors">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            Call
                          </a>
                        )}
                        {place.googleMapsUrl && (
                            <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white flex items-center transition-colors">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                View on Maps
                            </a>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 bg-white/5 border-2 border-dashed border-white/5 rounded-2xl">
                {loading ? (
                   <div className="flex flex-col items-center">
                       <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="animate-pulse">Analyzing map data...</p>
                   </div>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                        {error ? (
                            <p className="text-red-400 max-w-md text-center">{error}</p>
                        ) : (
                            <p className="text-lg">Set your location and click Find Places</p>
                        )}
                    </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NearbyCareFinder;
