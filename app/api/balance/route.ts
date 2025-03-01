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