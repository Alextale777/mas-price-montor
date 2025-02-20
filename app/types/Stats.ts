export class Stats {
    currentCycle: number;
    currentCycleTime: number;
    nextCycleTime: number;
    rollPrice: string;
    stakedRolls: number;
    stakedMas: number;
    totalStakersMainnet: number;
    stakingEntryPrice: number;
    totalBlocks: number;
    totalOps: number;

    constructor(data: any) {
        this.currentCycle = data.current_cycle;
        this.currentCycleTime = data.current_cycle_time;
        this.nextCycleTime = data.next_cycle_time;
        this.rollPrice = data.roll_price;
        this.stakedRolls = data.staked_rolls;
        this.stakedMas = data.staked_mas;
        this.totalStakersMainnet = data.total_stakers_mainnet;
        this.stakingEntryPrice = data.staking_entry_price;
        this.totalBlocks = data.total_blocks;
        this.totalOps = data.total_ops;
    }
}