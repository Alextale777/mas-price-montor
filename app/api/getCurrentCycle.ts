import { Stats } from '../types/Stats';


export async function getCurrentCycle(): Promise<Stats> {
    const response = await fetch('/api/info');
    const data = await response.json();
    return new Stats(data.stats);
}
