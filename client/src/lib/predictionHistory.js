const STORAGE_KEY = "vitalitynet.predictionHistory";
const MAX_ENTRIES_PER_USER = 20;
export const PREDICTION_HISTORY_UPDATED_EVENT = "vitalitynet:prediction-history-updated";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getUserStorageKey = (user) => user?.uid || user?.email || null;

const readStore = () => {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
};

const writeStore = (value) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(PREDICTION_HISTORY_UPDATED_EVENT));
};

const getHistoryKey = (entry) =>
  entry?.metadata?.clientPredictionId ||
  entry?.clientPredictionId ||
  entry?.id ||
  `${entry?.createdAt || ""}-${entry?.prediction || ""}`;

export const getLocalPredictionHistory = (user) => {
  const userKey = getUserStorageKey(user);

  if (!userKey) {
    return [];
  }

  const store = readStore();
  return Array.isArray(store[userKey]) ? store[userKey] : [];
};

export const saveLocalPredictionEntry = (user, { clientPredictionId, features, result }) => {
  const userKey = getUserStorageKey(user);

  if (!userKey || !clientPredictionId) {
    return null;
  }

  const store = readStore();
  const existingEntries = Array.isArray(store[userKey]) ? store[userKey] : [];

  const nextEntry = {
    id: `local-${clientPredictionId}`,
    clientPredictionId,
    createdAt: new Date().toISOString(),
    features,
    result: result?.result || null,
    prediction: result?.prediction || null,
    gifUrl: result?.gif_url || result?.gifUrl || null,
    metadata: {
      clientPredictionId,
      source: "local",
      userEmail: user?.email || null,
      userId: user?.uid || null,
    },
  };

  store[userKey] = [
    nextEntry,
    ...existingEntries.filter((entry) => getHistoryKey(entry) !== clientPredictionId),
  ].slice(0, MAX_ENTRIES_PER_USER);

  writeStore(store);
  return nextEntry;
};

export const mergePredictionHistories = (remoteEntries = [], localEntries = []) => {
  const mergedEntries = new Map();

  [...localEntries, ...remoteEntries].forEach((entry) => {
    const key = getHistoryKey(entry);
    const previousEntry = mergedEntries.get(key) || {};

    mergedEntries.set(key, {
      ...previousEntry,
      ...entry,
      metadata: {
        ...(previousEntry.metadata || {}),
        ...(entry.metadata || {}),
      },
    });
  });

  return Array.from(mergedEntries.values()).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || "") || 0;
    const rightTime = Date.parse(right.createdAt || "") || 0;
    return rightTime - leftTime;
  });
};
