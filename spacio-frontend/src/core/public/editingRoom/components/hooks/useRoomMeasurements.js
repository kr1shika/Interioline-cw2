import { useState, useCallback } from 'react';

export const useRoomMeasurements = () => {
    const [roomArea, setRoomArea] = useState(0);
    const [roomVolume, setRoomVolume] = useState(0);

    const calculateRoomMetrics = useCallback((dimensions) => {
        if (!dimensions) return;

        const { width, length, height } = dimensions;

        const area = width * length;
        setRoomArea(area);

        const volume = width * length * height;
        setRoomVolume(volume);
    }, []);

    return {
        roomArea,
        roomVolume,
        calculateRoomMetrics
    };
};