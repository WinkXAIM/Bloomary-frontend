const STORAGE_KEY = "bloomary_history";
const MAX_ITEMS = 50;

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getHistoryById(id) {
  return getHistory().find((item) => item.id === id) ?? null;
}

function saveToHistory(result) {
  const userRaw = localStorage.getItem("user");
  const userId = (() => {
    try {
      const parsed = userRaw ? JSON.parse(userRaw) : null;
      return parsed?.id ?? parsed ?? "";
    } catch {
      return userRaw ?? "";
    }
  })();

  const entry = {
    id: result.id ?? Date.now(),
    image_url: result.image_url ?? "",
    user_id: userId,
    flower_list: result.flower_list ?? [],
    story_message: result.story_message ?? "",
    created_at: result.created_at ?? new Date().toISOString(),
  };

  const list = getHistory();
  const existing = list.findIndex((item) => item.id === entry.id);
  if (existing !== -1) list.splice(existing, 1);
  list.unshift(entry);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  return entry;
}

function deleteFromHistory(id) {
  const list = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export { getHistory, getHistoryById, saveToHistory, deleteFromHistory, clearHistory };
