import { NextResponse } from 'next/server';
import { fetchWithTimeout } from '../../../utils/fetchWithTimeout';

interface PriceData {
    price: string;
    symbol: string;
    // 可以根据实际API响应添加其他字段
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    console.log(`Received request for symbol: ${symbol}`);

    if (!symbol) {
        return NextResponse.json(
            { error: 'Symbol parameter is required' },
            { status: 400 }
        );
    }

    try {
        const apiUrl = `https://www.bitget.com/v1/spot/public/getTickerInfoBySymbolCodeDisplayName?symbolCodeDisplayName=${symbol}`;
        console.log(`Fetching from URL: ${apiUrl}`);

        const response = await fetchWithTimeout(apiUrl);
        const data = await response.json() as PriceData[];
        console.log('Raw API response:', JSON.stringify(data, null, 2));

        if (!data || data.length === 0) {
            throw new Error("Invalid API response format");
        }

        const priceData = data[0];
        if (!priceData.price) {
            console.error('Unexpected price data structure:', priceData);
            throw new Error("Price not found in response");
        }

        const fetchedPrice = parseFloat(priceData.price);
        if (isNaN(fetchedPrice)) {
            console.error('Invalid price value:', priceData.price);
            throw new Error("Invalid price format");
        }

        console.log(`Successfully parsed price for ${symbol}: ${fetchedPrice}`);
        return NextResponse.json({ price: fetchedPrice });
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}