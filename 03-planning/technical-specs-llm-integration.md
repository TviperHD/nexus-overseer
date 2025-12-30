# Technical Specification: LLM Integration System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The LLM Integration System provides the interface between Nexus Overseer and local LLM runtime (Ollama). It manages model selection, API communication, request/response handling, and streaming support. The system supports two AI roles: Overseer AI (reasoning-focused model) and Implementation AI (code-focused model).

**Key Features:**
- Ollama API integration via HTTP
- Support for multiple models (different models for different AI roles)
- Streaming response handling
- Error handling and retry logic
- Model management (checking availability, loading models)
- Request/response caching (optional, for performance)

**Purpose:**
- Enable Overseer AI to use local LLM for reasoning and planning
- Enable Implementation AI to use local LLM for code generation
- Provide unified interface for LLM operations
- Handle all LLM communication securely and efficiently

---

## System Architecture

### High-Level Design

The LLM Integration System consists of:

1. **LLM Client Module (Rust):** HTTP client for Ollama API communication
2. **Model Manager:** Manages model selection and availability
3. **Request Handler:** Formats requests and handles responses
4. **Streaming Handler:** Manages streaming responses
5. **Error Handler:** Handles errors and retries

### Component Hierarchy

```
LLMIntegration (Main Module)
├── OllamaClient (HTTP client)
│   ├── RequestBuilder (Request formatting)
│   └── ResponseParser (Response parsing)
├── ModelManager (Model selection and management)
├── StreamingHandler (Streaming response management)
└── ErrorHandler (Error handling and retries)
```

### Data Flow

```
AI System (Overseer/Implementation)
  ↓
LLM Integration Module
  ↓
OllamaClient (HTTP request)
  ↓
Ollama API (localhost:11434)
  ↓
Response (streaming or complete)
  ↓
ResponseParser
  ↓
AI System (receives response)
```

---

## Data Structures

### Backend (Rust)

**Model Configuration:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub name: String,                    // Model name (e.g., "llama3.1:8b")
    pub role: AIRole,                    // overseer or implementation
    pub base_url: String,                // Ollama API URL (default: http://localhost:11434)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIRole {
    Overseer,
    Implementation,
}
```

**LLM Request:**
```rust
#[derive(Debug, Clone, Serialize)]
pub struct LLMRequest {
    pub model: String,                   // Model name
    pub prompt: String,                  // User prompt
    pub context: Option<String>,         // Additional context
    pub stream: bool,                    // Whether to stream response
    pub temperature: Option<f32>,        // Temperature (0.0-1.0)
    pub max_tokens: Option<u32>,          // Max tokens to generate
}
```

**LLM Response:**
```rust
#[derive(Debug, Clone, Deserialize)]
pub struct LLMResponse {
    pub model: String,
    pub response: String,                // Complete response text
    pub done: bool,                      // Whether response is complete
    pub context: Option<Vec<u32>>,       // Context for continuation
}

#[derive(Debug, Clone, Deserialize)]
pub struct LLMStreamChunk {
    pub model: String,
    pub response: String,                // Chunk of response
    pub done: bool,                      // Whether this is the final chunk
}
```

**Model Status:**
```rust
#[derive(Debug, Clone)]
pub struct ModelStatus {
    pub name: String,
    pub available: bool,                 // Whether model is loaded/available
    pub size: Option<u64>,               // Model size in bytes
    pub modified_at: Option<DateTime<Utc>>,
}
```

**LLM Client Configuration:**
```rust
#[derive(Debug, Clone)]
pub struct LLMClientConfig {
    pub base_url: String,                // Ollama API base URL
    pub timeout: Duration,              // Request timeout
    pub max_retries: u32,                // Max retry attempts
    pub retry_delay: Duration,           // Delay between retries
    pub overseer_model: String,          // Default model for Overseer AI
    pub implementation_model: String,    // Default model for Implementation AI
}
```

### Frontend (TypeScript)

**LLM Request Interface:**
```typescript
interface LLMRequest {
  model: string;
  prompt: string;
  context?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface LLMResponse {
  model: string;
  response: string;
  done: boolean;
}
```

**Model Configuration Interface:**
```typescript
interface ModelConfig {
  name: string;
  role: 'overseer' | 'implementation';
  baseUrl: string;
}

interface ModelStatus {
  name: string;
  available: boolean;
  size?: number;
  modifiedAt?: string;
}
```

---

## Core Components

### Backend Modules

#### llm.rs (Main Module)

**Purpose:** Core LLM integration module providing unified interface for LLM operations.

**Key Functions:**

**Model Management:**
- `check_model_available(model_name)` - Check if model is available
- `list_available_models()` - List all available models
- `get_model_for_role(role)` - Get configured model for AI role
- `set_model_for_role(role, model_name)` - Set model for AI role

**Request Handling:**
- `generate(prompt, role, options?)` - Generate complete response
- `generate_streaming(prompt, role, callback)` - Generate streaming response
- `chat(messages, role, options?)` - Chat completion (conversation)
- `chat_streaming(messages, role, callback)` - Streaming chat completion

**Configuration:**
- `load_config()` - Load LLM configuration
- `save_config(config)` - Save LLM configuration
- `update_config(updates)` - Update configuration

#### ollama_client.rs

**Purpose:** HTTP client for Ollama API communication.

**Key Functions:**
- `new(base_url)` - Create new Ollama client
- `generate(request)` - Send generate request
- `generate_streaming(request, callback)` - Send streaming generate request
- `chat(request)` - Send chat request
- `chat_streaming(request, callback)` - Send streaming chat request
- `list_models()` - List available models
- `check_model(name)` - Check if model exists

**Implementation Details:**
- Uses `reqwest` crate for HTTP client
- Async/await for non-blocking operations
- Handles HTTP errors and timeouts
- Supports streaming via `reqwest::Response` streaming

#### model_manager.rs

**Purpose:** Manages model selection and availability.

**Key Functions:**
- `get_model_for_role(role)` - Get model name for AI role
- `set_model_for_role(role, model_name)` - Set model for role
- `check_model_available(model_name)` - Check model availability
- `load_model_list()` - Load list of available models from Ollama

#### streaming_handler.rs

**Purpose:** Handles streaming responses from Ollama.

**Key Functions:**
- `handle_stream(response, callback)` - Process streaming response
- `parse_chunk(chunk)` - Parse JSON chunk from stream
- `accumulate_response(chunks)` - Accumulate chunks into full response

### Tauri Commands

**IPC Commands for Frontend-Backend Communication:**

```rust
#[tauri::command]
async fn llm_generate(prompt: String, role: String) -> Result<String>;

#[tauri::command]
async fn llm_generate_streaming(prompt: String, role: String) -> Result<()>; // Uses events

#[tauri::command]
async fn llm_chat(messages: Vec<ChatMessage>, role: String) -> Result<String>;

#[tauri::command]
async fn llm_chat_streaming(messages: Vec<ChatMessage>, role: String) -> Result<()>;

#[tauri::command]
async fn llm_list_models() -> Result<Vec<ModelStatus>>;

#[tauri::command]
async fn llm_check_model(model_name: String) -> Result<bool>;

#[tauri::command]
async fn llm_get_model_for_role(role: String) -> Result<String>;

#[tauri::command]
async fn llm_set_model_for_role(role: String, model_name: String) -> Result<()>;
```

---

## Algorithms

### Generate Request Flow

1. AI system calls `generate(prompt, role)`
2. LLM module gets model name for role from ModelManager
3. LLM module creates LLMRequest with prompt and model
4. OllamaClient sends HTTP POST to `/api/generate`
5. Ollama processes request and returns response
6. ResponseParser extracts response text
7. Return response to AI system

### Streaming Request Flow

1. AI system calls `generate_streaming(prompt, role, callback)`
2. LLM module gets model name and creates request
3. OllamaClient sends streaming request
4. StreamingHandler processes response stream
5. For each chunk:
   - Parse JSON chunk
   - Extract response text
   - Call callback with chunk
6. When done, call callback with final chunk (done=true)
7. Return accumulated full response

### Model Availability Check

1. Call Ollama API `/api/tags` to list models
2. Parse response to get model list
3. Check if requested model is in list
4. Return availability status

### Error Handling and Retry

1. Attempt request
2. If error occurs:
   - Check error type (timeout, connection, server error)
   - If retryable (timeout, connection), wait and retry
   - If not retryable (invalid model, bad request), return error immediately
3. Retry up to max_retries times
4. If all retries fail, return error to caller

---

## Integration Points

### With Overseer AI

**Overseer AI Uses LLM:**
- Calls `generate(prompt, "overseer")` for planning and analysis
- Uses reasoning-focused model (e.g., Llama 3.1 8B)
- Receives responses for project management tasks
- May use streaming for long responses

**Integration Method:**
- Overseer AI module calls LLM integration functions
- LLM module handles all Ollama communication
- Overseer AI receives text responses

### With Implementation AI

**Implementation AI Uses LLM:**
- Calls `generate(prompt, "implementation")` for code generation
- Uses code-focused model (e.g., Qwen2.5-Coder 7B)
- Receives code responses
- May use streaming for long code generation

**Integration Method:**
- Implementation AI module calls LLM integration functions
- LLM module handles all Ollama communication
- Implementation AI receives code text responses

### With Configuration System

**Model Configuration:**
- LLM configuration stored in config file
- User can change models via settings
- Configuration system manages LLM config
- LLM module loads config on startup

### With Error Handling

**Error Reporting:**
- LLM errors reported to user via UI
- Error messages are user-friendly
- Technical details logged for debugging
- Retry attempts logged

---

## Configuration

### Default Configuration

**File:** `.nexus-overseer/config.json` (or app config directory)

**Structure:**
```json
{
  "llm": {
    "baseUrl": "http://localhost:11434",
    "timeout": 300,
    "maxRetries": 3,
    "retryDelay": 1000,
    "models": {
      "overseer": "llama3.1:8b",
      "implementation": "qwen2.5-coder:7b"
    }
  }
}
```

### Model Selection

**Default Models:**
- **Overseer AI:** Llama 3.1 8B (or similar reasoning model)
- **Implementation AI:** Qwen2.5-Coder 7B (or similar code model)

**User Can Change:**
- Models can be changed in settings
- User can test different models
- Configuration persists across sessions

---

## Performance Considerations

### Request Optimization

1. **Connection Pooling:** Reuse HTTP connections to Ollama
2. **Request Batching:** Batch multiple requests when possible
3. **Caching:** Cache common responses (optional, for repeated queries)
4. **Timeout Management:** Set appropriate timeouts to avoid hanging

### Streaming Optimization

1. **Chunk Processing:** Process chunks as they arrive (don't wait for full response)
2. **Buffer Management:** Manage buffer size for streaming
3. **Error Recovery:** Handle stream interruptions gracefully

### Model Management

1. **Lazy Loading:** Don't preload all models
2. **Model Checking:** Check availability before use
3. **Fallback Models:** Have fallback models if primary unavailable

---

## Security Considerations

1. **Local Only:** All LLM calls are local (no external network)
2. **Input Validation:** Validate all prompts before sending
3. **Error Messages:** Don't expose internal errors to users
4. **Model Validation:** Validate model names before use
5. **Timeout Protection:** Prevent hanging requests

---

## Error Handling

### Error Types

1. **Connection Errors:** Ollama not running, connection refused
2. **Timeout Errors:** Request took too long
3. **Model Errors:** Model not found, model loading failed
4. **API Errors:** Invalid request, server error
5. **Stream Errors:** Stream interrupted, parsing error

### Error Handling Strategy

1. **Retry Logic:** Retry connection and timeout errors
2. **User Feedback:** Show user-friendly error messages
3. **Logging:** Log technical details for debugging
4. **Fallback:** Use fallback model if primary fails
5. **Graceful Degradation:** Continue with reduced functionality if possible

---

## Testing Checklist

### Unit Tests

- [ ] Model availability checking
- [ ] Request formatting
- [ ] Response parsing
- [ ] Error handling
- [ ] Retry logic
- [ ] Configuration loading

### Integration Tests

- [ ] Ollama API communication
- [ ] Streaming response handling
- [ ] Model switching
- [ ] Error recovery
- [ ] Timeout handling

### User Acceptance Tests

- [ ] Overseer AI can generate responses
- [ ] Implementation AI can generate code
- [ ] Streaming responses work smoothly
- [ ] Model changes take effect
- [ ] Errors are handled gracefully
- [ ] Performance is acceptable

---

## Research Notes

### Ollama API Integration

**Research Findings:**
- Ollama provides REST API at `http://localhost:11434`
- Main endpoints: `/api/generate`, `/api/chat`, `/api/tags`
- Supports streaming via `stream: true` parameter
- Uses JSON for request/response format
- Simple HTTP POST requests

**Sources:**
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- Ollama GitHub repository

**Implementation Approach:**
- Use `reqwest` crate for HTTP client (async, supports streaming)
- Use `serde` for JSON serialization/deserialization
- Handle streaming via `reqwest::Response` stream
- Parse JSON chunks from stream

**Why This Approach:**
- `reqwest` is the standard Rust HTTP client
- Async support for non-blocking operations
- Built-in streaming support
- Well-maintained and reliable

### Model Selection Strategy

**Research Findings:**
- Different models excel at different tasks
- Reasoning models (Llama 3.1) better for planning/analysis
- Code models (Qwen2.5-Coder, CodeLlama) better for code generation
- 7B-8B models are good balance of quality and performance

**Sources:**
- Research on local LLM models
- Model comparison resources
- Code generation model benchmarks

**Implementation Approach:**
- Use separate models for Overseer and Implementation AI
- Allow user to configure models
- Default to recommended models
- Support model switching

**Why This Approach:**
- Specialized models perform better for specific tasks
- User flexibility to choose models
- Can optimize for different use cases
- Future-proof (can add more models)

### Streaming Response Handling

**Research Findings:**
- Streaming improves perceived performance
- Users see responses as they're generated
- Better UX for long responses
- Requires chunk parsing and accumulation

**Sources:**
- Ollama API documentation on streaming
- General streaming response patterns

**Implementation Approach:**
- Support both streaming and non-streaming
- Parse JSON chunks from stream
- Accumulate chunks into full response
- Call callback for each chunk (for UI updates)

**Why This Approach:**
- Better user experience
- More responsive interface
- Standard pattern for LLM APIs
- Flexible (can use streaming or not)

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement Ollama client module
3. ⏳ Implement model manager
4. ⏳ Implement streaming handler
5. ⏳ Implement error handling and retry logic
6. ⏳ Create Tauri commands
7. ⏳ Integrate with Overseer AI
8. ⏳ Integrate with Implementation AI
9. ⏳ Testing and refinement

---

## Notes

- LLM integration is foundational - other AI systems depend on it
- Keep it simple and reliable
- Focus on error handling and user feedback
- Performance is important (local LLMs can be slow)
- Streaming is optional but improves UX
- Model selection is critical for quality results

