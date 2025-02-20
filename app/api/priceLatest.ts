export async function getLatestPrice(symbolCodeDisplayName: string) {
    const response = await fetch(`/api/price?symbol=${symbolCodeDisplayName}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.price;
}