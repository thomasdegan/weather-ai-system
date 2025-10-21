#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class TestMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'test-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_tool',
            description: 'A simple test tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'A test message',
                },
              },
              required: ['message'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'test_tool') {
        return {
          content: [
            {
              type: 'text',
              text: `Test successful! You said: ${args.message}`,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Test MCP server running on stdio');
  }
}

// Start the server
const server = new TestMCPServer();
server.run().catch(console.error);
