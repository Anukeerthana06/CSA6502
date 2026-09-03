/**
 * NyayaMithra API Client (frontend/src/api.js)
 * Centralized HTTP service communicating with FastAPI backend (default: http://127.0.0.1:8000).
 */

let API_BASE_URL = typeof window !== 'undefined' && localStorage.getItem('NYAYAMITHRA_API_URL') 
  ? localStorage.getItem('NYAYAMITHRA_API_URL') 
  : 'http://127.0.0.1:8000';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function setApiBaseUrl(newUrl) {
  API_BASE_URL = newUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('NYAYAMITHRA_API_URL', API_BASE_URL);
  }
}

async function fetchJson(endpoint, options = {}, timeoutMs = 30000) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { message: `Server error HTTP ${res.status}: ${res.statusText}` };
      }
      return {
        error: true,
        status: res.status,
        message: errorData.message || (errorData.detail && errorData.detail.message) || errorData.detail || 'An unexpected error occurred.',
      };
    }

    const data = await res.json();
    return { error: false, ...data };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        error: true,
        message: `Request timed out after ${timeoutMs / 1000}s. Verify your local backend and Ollama server.`,
      };
    }
    return {
      error: true,
      backendOffline: true,
      message: 'Backend is not running. Start FastAPI with: python -m uvicorn backend.main:app --reload --port 8000',
      technicalError: err.message,
    };
  }
}

export async function checkSystemHealth() {
  return await fetchJson('/api/health', { method: 'GET' }, 5000);
}

export async function checkOllamaHealth() {
  return await fetchJson('/api/health/ollama', { method: 'GET' }, 5000);
}

export async function checkChromaHealth() {
  return await fetchJson('/api/health/chroma', { method: 'GET' }, 5000);
}

export async function sendLegalChat(message, language = 'English') {
  return await fetchJson('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  }, 45000);
}

export async function generateLegalDraft(draftData) {
  return await fetchJson('/api/draft', {
    method: 'POST',
    body: JSON.stringify(draftData),
  }, 50000);
}

export async function convertComplaintToDraft(complaintText, language = 'English') {
  return await fetchJson('/api/complaint-to-draft', {
    method: 'POST',
    body: JSON.stringify({ complaint_text: complaintText, language }),
  }, 50000);
}

export async function getDocumentsList() {
  return await fetchJson('/api/documents', { method: 'GET' }, 5000);
}

export async function getDocumentsCount() {
  return await fetchJson('/api/documents/count', { method: 'GET' }, 5000);
}

export async function triggerIngest(rebuild = false) {
  return await fetchJson(`/api/ingest?rebuild=${rebuild}`, {
    method: 'POST',
  }, 60000);
}

export async function uploadDocumentFile(file, category = 'acts') {
  const url = `${API_BASE_URL}/api/documents/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { error: true, message: err.message || (err.detail && err.detail.message) || 'Upload failed' };
    }
    return await res.json();
  } catch (err) {
    return {
      error: true,
      message: 'Failed to upload document. Backend may be offline.',
    };
  }
}
