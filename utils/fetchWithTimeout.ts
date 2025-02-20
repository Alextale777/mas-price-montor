import fetch, { RequestInit, Response } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

// fetchWithTimeout.ts
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000, // 增加到5秒
    retryCount = 2, // 默认重试2次
    timeoutMultiplier = 1.5 // 每次重试增加50%超时时间
  ): Promise<Response> {
    const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:1089');

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      const currentTimeout = timeout * Math.pow(timeoutMultiplier, attempt);
      const controller = new AbortController();
      const { signal } = controller;
      
      // 添加更多必要的请求头
      const defaultHeaders = {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...options.headers,
      };

      console.log(`[Attempt ${attempt + 1}] Fetching ${url} with timeout ${currentTimeout}ms`);
      const startTime = Date.now();

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error(`Request timeout after ${currentTimeout}ms`));
        }, currentTimeout);
        signal.addEventListener('abort', () => clearTimeout(timeoutId));
      });

      console.time('fetch-request');
      try {
        const fetchPromise = fetch(url, {
          ...options,
          headers: defaultHeaders,
          signal,
          agent: proxyAgent, // 现在类型正确了
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        console.log(`[Success] Request completed in ${Date.now() - startTime}ms`);
        console.timeEnd('fetch-request');
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Error] Request failed after ${duration}ms:`, error);
        console.timeEnd('fetch-request');
        if (attempt === retryCount || !(error instanceof Error) || error.name !== 'AbortError') {
          throw error;
        }
        console.log(`Retrying... (${attempt + 1}/${retryCount})`);
      }
    }
    throw new Error('Unknown error occurred');
  }