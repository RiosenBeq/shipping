/**
 * AI crawlers named in robots.txt and listed in llms.txt. Search, assistant
 * (user-triggered) and training bots are all welcome: the site's content is
 * meant to be cited.
 */
export const AI_AGENTS = [
  // OpenAI: training, ChatGPT search index, user-triggered fetches
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google (Gemini / AI Overviews training control token) and Apple
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  // Amazon, Meta, DuckDuckGo, Mistral, Cohere, You.com, Common Crawl
  "Amazonbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "cohere-training-data-crawler",
  "YouBot",
  "CCBot",
];
