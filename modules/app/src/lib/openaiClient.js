const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const model = 'gpt-5.2-2025-12-11';

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

const chatCompletionStream = async function* (messages, tools) {
    const params = { model, messages, stream: true };

    if (tools?.length) {
        params.tools = tools;
        params.tool_choice = 'auto';
    }

    const stream = await client.chat.completions.create(params);

    let contentBuffer = '';
    const toolCalls = {};

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
            contentBuffer += delta.content;
            yield { type: 'delta', content: delta.content };
        }

        if (!delta.tool_calls) continue;
        for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCalls[idx]) {
                toolCalls[idx] = { id: tc.id, type: 'function', function: { name: '', arguments: '' } };
            }
            if (tc.id) toolCalls[idx].id = tc.id;
            if (tc.function?.name) toolCalls[idx].function.name += tc.function.name;
            if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
        }
    }

    const assembled = { role: 'assistant', content: contentBuffer || null };
    const calls = Object.values(toolCalls);
    if (calls.length) assembled.tool_calls = calls;

    yield { type: 'done', message: assembled };
};

module.exports = { chatCompletion, chatCompletionStream };
