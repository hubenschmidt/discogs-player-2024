const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const model = 'gpt-5.1-2025-11-13';

const chatCompletion = async (messages, tools) => {
    const params = {
        model,
        messages,
    };

    if (tools?.length) {
        params.tools = tools;
        params.tool_choice = 'auto';
    }

    const response = await client.chat.completions.create(params);
    return response.choices[0].message;
};

const accumulateToolCall = (toolCalls, tc) => {
    const idx = tc.index;
    if (!toolCalls[idx]) {
        toolCalls[idx] = {
            id: tc.id,
            type: 'function',
            function: { name: '', arguments: '' },
        };
    }
    if (tc.id) toolCalls[idx].id = tc.id;
    if (tc.function?.name) toolCalls[idx].function.name += tc.function.name;
    if (tc.function?.arguments)
        toolCalls[idx].function.arguments += tc.function.arguments;
};

const processDelta = (delta, contentBuffer, onDelta, toolCalls) => {
    if (!delta) return contentBuffer;

    const updatedContent = delta.content
        ? (onDelta(delta.content), contentBuffer + delta.content)
        : contentBuffer;

    if (delta.tool_calls)
        delta.tool_calls.forEach(tc => accumulateToolCall(toolCalls, tc));

    return updatedContent;
};

const chatCompletionStream = async (messages, tools, onDelta) => {
    const params = {
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
    };

    if (tools?.length) {
        params.tools = tools;
        params.tool_choice = 'auto';
    }

    const stream = await client.chat.completions.create(params);

    let contentBuffer = '';
    const toolCalls = {};
    let usage = null;

    for await (const chunk of stream) {
        if (chunk.usage) usage = chunk.usage;
        contentBuffer = processDelta(
            chunk.choices[0]?.delta,
            contentBuffer,
            onDelta,
            toolCalls,
        );
    }

    usage = usage ?? stream.usage ?? null;

    const assembled = { role: 'assistant', content: contentBuffer || null };
    const calls = Object.values(toolCalls);
    if (calls.length) assembled.tool_calls = calls;

    return { ...assembled, usage };
};

const embed = async texts => {
    const response = await client.embeddings.create({
        model: 'text-embedding-3-large',
        input: texts,
    });
    return response.data.map(d => d.embedding);
};

module.exports = { chatCompletion, chatCompletionStream, embed };
