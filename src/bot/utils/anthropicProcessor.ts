import { Anthropic } from '@anthropic-ai/sdk';

export async function processIssueContent(message: string): Promise<{title: string, body: string}> {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Escape any special characters in the message
    const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const prompt = `
    You are a helpful assistant that converts Discord messages into well-formatted GitHub issues.
    Format the following Discord message into a clear GitHub issue with:
    - A concise title
    - A detailed description
    - Any code blocks properly formatted
    - Steps to reproduce if applicable
    - Expected vs actual behavior if it's a bug
    
    Discord message: ${escapedMessage}
    
    Respond with only valid JSON in this format:
    {
        "title": "Brief issue title",
        "body": "Formatted issue description\\n\\n---\\n\\nOriginal Message:\\n${escapedMessage}"
    }`;

    const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });

    return JSON.parse(response.content[0].text);
}
