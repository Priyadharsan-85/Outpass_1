const STORAGE_KEY = "student_outpass_requests";
const INITIAL_REQUESTS = { pending: [], approved: [], rejected: [] };

export function getOutpassRequests() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REQUESTS;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
}

export function setOutpassRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function addOutpassRequest(request) {
  const requests = getOutpassRequests();
  requests.pending.push(request);
  setOutpassRequests(requests);
}

export function updateOutpassRequestStatus(requestId, newStatus) {
  const requests = getOutpassRequests();
  let found = null;
  // Remove from all arrays
  ['pending', 'approved', 'rejected'].forEach(status => {
    const idx = requests[status].findIndex(req => req.requestId === requestId);
    if (idx !== -1) {
      found = { ...requests[status][idx] };
      requests[status].splice(idx, 1);
    }
  });
  if (found) {
    found.status = newStatus;
    requests[newStatus].push(found);
    setOutpassRequests(requests);
  }
} 