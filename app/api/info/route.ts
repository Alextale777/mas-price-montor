import { Stats } from '../../types/Stats';

export async function GET() {
    try {
      const response = await fetch(
        'https://explorer-api.massa.net/info'
      );
      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: '获取余额失败' }, { status: 500 });
    }
}