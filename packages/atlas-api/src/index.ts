type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response, retry: (newConfig?: RequestInit) => Promise<Response>, config: RequestInit) => Response | Promise<Response>;

export class AtlasApi {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  public setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  public addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  private async executeRequest(url: string, config: RequestInit): Promise<Response> {
    let currentConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    let response = await fetch(fullUrl, currentConfig);

    const retry = async (newConfig?: RequestInit) => {
      return fetch(fullUrl, newConfig || currentConfig);
    };

    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response, retry, currentConfig);
    }

    return response;
  }

  public async get<T>(url: string, config?: RequestInit): Promise<T> {
    const response = await this.executeRequest(url, { ...config, method: 'GET' });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  public async post<T>(url: string, data?: any, config?: RequestInit): Promise<T> {
    const response = await this.executeRequest(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  public async put<T>(url: string, data?: any, config?: RequestInit): Promise<T> {
    const response = await this.executeRequest(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  public async delete<T>(url: string, config?: RequestInit): Promise<T> {
    const response = await this.executeRequest(url, { ...config, method: 'DELETE' });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
}

export const api = new AtlasApi('/api/v1');
