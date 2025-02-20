"use client";

import { useEffect, useState } from "react";
import { getBalance } from "./api/getBalance";
import { getCurrentCycle } from "./api/getCurrentCycle";
import { getLatestPrice } from "./api/priceLatest"; // 新增导入

export default function Home() {
  const [balance, setBalance] = useState<string>("--");
  const [profit, setProfit] = useState<string>("--");
  const [cycleStats, setCycleStats] = useState<any>(null);
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState<number>(0);
  const [latestPrice, setLatestPrice] = useState<string>("--"); // 新增状态
  const [usdProfit, setUsdProfit] = useState<string>("--");
  const baseBalance = 38.16254;

  useEffect(() => {
    document.title = "MAS Price Monitor";

    async function fetchBalance() {
      try {
        const newBalance = await getBalance();
        const numericBalance = Number(newBalance);
        if (isNaN(numericBalance)) {
          throw new Error("Invalid balance value");
        }
        setBalance(numericBalance.toFixed(5));
        const calculatedProfit = numericBalance - baseBalance;
        setProfit(calculatedProfit.toFixed(5));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("Error");
        setProfit("Error");
      }
    }

    async function fetchCycleStats() {
      try {
        const stats = await getCurrentCycle();
        setCycleStats(stats);
        setRemainingTimeInSeconds(Math.max(0, (stats.nextCycleTime - Date.now()) / 1000));
        if (stats.currentCycleTime === stats.nextCycleTime) {
          fetchBalance();
        }
      } catch (error) {
        console.error("Error fetching cycle stats:", error);
      }
    }

    async function fetchLatestPrice() {
      try {
        const price = await getLatestPrice('MASUSDT');
        setLatestPrice(price.toString()); // 移除 toFixed(2)，显示完整价格
        // 计算USD收益
        if (profit !== "--" && profit !== "Error") {
          const usdValue = parseFloat(profit) * price;
          setUsdProfit(usdValue.toFixed(2));
        }
      } catch (error) {
        console.error("Error fetching latest price:", error);
        setLatestPrice("Error");
        setUsdProfit("Error");
      }
    }

    fetchBalance();
    fetchCycleStats();
    fetchLatestPrice();
    const balanceIntervalId = setInterval(fetchBalance, 300000); // 每分钟获取一次余额数据
    const cycleIntervalId = setInterval(fetchCycleStats, 60000); // 每分钟获取一次周期数据
    const priceIntervalId = setInterval(fetchLatestPrice, 60000); // 每分钟获取一次最新价格

    const countdownIntervalId = setInterval(() => {
      setRemainingTimeInSeconds(prev => Math.max(0, prev - 1));
    }, 1000); // 每秒更新一次倒计时

    return () => {
      clearInterval(balanceIntervalId);
      clearInterval(cycleIntervalId);
      clearInterval(countdownIntervalId);
      clearInterval(priceIntervalId); // 清除价格定时器
    };
  }, [profit]); // 添加 profit 作为依赖

  const remainingTime = cycleStats ? (Date.now() - cycleStats.currentCycleTime) / (cycleStats.nextCycleTime - cycleStats.currentCycleTime) * 100 : 0;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* 第一行卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
            <h2 className="text-xl font-bold">Mas Balance</h2>
            <p className="text-2xl font-mono mt-auto">
              {balance === "--" ? "Loading..." : balance}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
            <h2 className="text-xl font-bold">Base Balance</h2>
            <p className="text-2xl font-mono mt-auto">{baseBalance.toFixed(5)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
            <h2 className="text-xl font-bold">Profit</h2>
            <p className="text-2xl font-mono mt-auto">
              {profit === "--" ? "Loading..." : profit}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
            <h2 className="text-xl font-bold">Latest Price</h2>
            <p className="text-2xl font-mono mt-auto">
              {latestPrice === "--" ? "Loading..." : latestPrice}
            </p>
          </div>
        </div>

        {/* 第二行卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
            <h2 className="text-xl font-bold">Total Profit (USD)</h2>
            <p className="text-2xl font-mono mt-auto">
              {usdProfit === "--" ? "Loading..." : `$${usdProfit}`}
            </p>
          </div>
          {cycleStats && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between min-h-[160px]">
              <h2 className="text-xl font-bold">Cycle Info</h2>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex justify-between text-sm font-mono">
                  <span>Start:</span>
                  <span>{new Date(cycleStats.currentCycleTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span>End:</span>
                  <span>{new Date(cycleStats.nextCycleTime).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${remainingTime}%` }}></div>
                </div>
                <p className="text-sm font-mono mt-2">{remainingTimeInSeconds.toFixed(0)} seconds left</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}