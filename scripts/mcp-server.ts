#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { readRegistryCatalog, readRegistryResource } from './mcp-resources';

const projectRoot = process.cwd();
const server = new Server({ name: 'obsidian-ui', version: '0.1.0' }, { capabilities: { resources: {} } });
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
        return { resources: readRegistryCatalog(projectRoot).items.map(item => ({
            uri: `obsidian://${item.name}`, name: item.name, ...(item.title ? { title: item.title } : {}),
            mimeType: 'application/json', description: item.description ?? `Component: ${item.name}`,
        })) };
    } catch (error) {
        throw new McpError(ErrorCode.InternalError, error instanceof Error ? error.message : 'Registry unavailable');
    }
});
server.setRequestHandler(ReadResourceRequestSchema, async request => {
    try {
        return { contents: [{ uri: request.params.uri, mimeType: 'application/json', text: readRegistryResource(projectRoot, request.params.uri) }] };
    } catch (error) {
        throw new McpError(ErrorCode.InvalidRequest, error instanceof Error ? error.message : 'Invalid component resource');
    }
});
server.onerror = error => console.error('[MCP Error]', error);
process.on('SIGINT', async () => { await server.close(); process.exit(0); });
server.connect(new StdioServerTransport()).then(() => {
    console.error('ObsidianUI MCP resources server running on stdio');
}).catch(error => { console.error(error); process.exitCode = 1; });
