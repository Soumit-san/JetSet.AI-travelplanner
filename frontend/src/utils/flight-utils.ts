export const parseIsoDuration = (dur: string): number => {
    if (!dur) return 0;
    const timeStr = dur.replace('PT', '');
    let hours = 0, mins = 0;
    const hMatch = timeStr.match(/(\d+)H/);
    const mMatch = timeStr.match(/(\d+)M/);
    if (hMatch) hours = parseInt(hMatch[1]);
    if (mMatch) mins = parseInt(mMatch[1]);
    return hours * 60 + mins;
};

export const getFlightScore = (flight: any): { price: number; duration: number; score: number } => {
    const price = parseFloat(flight.price?.total || '0');
    const duration = parseIsoDuration(flight.itineraries?.[0]?.duration || '');
    const score = price + (duration * 0.5);
    return { price, duration, score };
};

export const compareFlights = (a: any, b: any, sortBy: 'CHEAPEST' | 'FASTEST' | 'BEST'): number => {
    const scoreA = getFlightScore(a);
    const scoreB = getFlightScore(b);

    if (sortBy === 'CHEAPEST') return scoreA.price - scoreB.price;
    if (sortBy === 'FASTEST') return scoreA.duration - scoreB.duration;
    // BEST: simplified score combining price and duration
    return scoreA.score - scoreB.score;
};
