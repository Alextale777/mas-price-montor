// export async function getBalance() {
//   const response = await fetch('https://explorer-api.massa.net/address/AU12HZGccLRNGEGiHrcsD2rDd7cuBTMtMydgd2PxfyPqFn5RUBv1F');
//   const data = await response.json();
//   return data.final_balance;
// }

export async function getBalance() {
  const response = await fetch('/api/balance');
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return {balance: data.balance, rolls: data.rolls};
}

export async function GET() {
  try {
    const response = await fetch(
      'https://explorer-api.massa.net/address/AU12HZGccLRNGEGiHrcsD2rDd7cuBTMtMydgd2PxfyPqFn5RUBv1F'
    );
    const data = await response.json();
    return Response.json({ balance: data.final_balance, rolls: data.final_roll_count });
  } catch (error) {
    return Response.json({ error: '获取余额失败' }, { status: 500 });
  }
}