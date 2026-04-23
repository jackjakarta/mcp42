import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const inputSchema = z.object({
  city: z.string().min(1).describe('City name, e.g. "Berlin"'),
  units: z
    .enum(['metric', 'imperial'])
    .optional()
    .describe('Temperature unit system (defaults to metric)'),
});

const outputSchema = z.object({
  city: z.string(),
  units: z.enum(['metric', 'imperial']),
  temperature: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
});

const CONDITIONS = ['sunny', 'cloudy', 'rainy', 'snowy'] as const;

function mockWeather(city: string, units: 'metric' | 'imperial') {
  const seed = [...city.toLowerCase()].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const condition = CONDITIONS[seed % CONDITIONS.length] ?? 'sunny';
  const baseC = 5 + (seed % 25);
  const temperature = units === 'metric' ? baseC : Math.round(baseC * 1.8 + 32);
  return { condition, temperature };
}

export function registerWeatherTool(server: McpServer): void {
  server.registerTool(
    'get-weather',
    {
      title: 'Get Weather',
      description: 'Get a (mocked) current weather report for a city.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ city, units }): Promise<CallToolResult> => {
      const resolvedUnits = units ?? 'metric';
      const { condition, temperature } = mockWeather(city, resolvedUnits);
      const unitSymbol = resolvedUnits === 'metric' ? '°C' : '°F';
      return {
        content: [
          { type: 'text', text: `Weather in ${city}: ${condition}, ${temperature}${unitSymbol}` },
        ],
        structuredContent: { city, units: resolvedUnits, temperature, condition },
      };
    },
  );
}
