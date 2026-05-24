import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class HttpService {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException(
        `Failed to fetch: ${response.statusText}`,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }
}
