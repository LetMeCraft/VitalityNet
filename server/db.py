import os
import time
from datetime import datetime, timezone

try:
  from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional until dependencies are installed
  load_dotenv = None

try:
  from pymongo import MongoClient
  from pymongo.server_api import ServerApi
except ImportError:  # pragma: no cover - optional until dependencies are installed
  MongoClient = None
  ServerApi = None

if load_dotenv:
  load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "vitalitynet")
MONGODB_PREDICTIONS_COLLECTION = os.getenv(
  "MONGODB_PREDICTIONS_COLLECTION",
  "predictions",
)
MONGODB_CONTACT_COLLECTION = os.getenv(
  "MONGODB_CONTACT_COLLECTION",
  "contact_messages",
)


def _get_int_env(name, default):
  try:
    return int(os.getenv(name, str(default)))
  except (TypeError, ValueError):
    return default


# Keep API requests responsive when MongoDB is unreachable.
MONGODB_SERVER_SELECTION_TIMEOUT_MS = _get_int_env(
  "MONGODB_SERVER_SELECTION_TIMEOUT_MS",
  3000,
)
MONGODB_CONNECT_TIMEOUT_MS = _get_int_env(
  "MONGODB_CONNECT_TIMEOUT_MS",
  3000,
)
MONGODB_SOCKET_TIMEOUT_MS = _get_int_env(
  "MONGODB_SOCKET_TIMEOUT_MS",
  5000,
)
MONGODB_RETRY_COOLDOWN_SECONDS = _get_int_env(
  "MONGODB_RETRY_COOLDOWN_SECONDS",
  15,
)

_client = None
_database = None
_last_connection_error = None
_last_connection_error_at = None


class StorageUnavailableError(RuntimeError):
  pass


def _remember_connection_error(exc):
  global _client, _database, _last_connection_error, _last_connection_error_at

  _database = None
  _last_connection_error = str(exc)
  _last_connection_error_at = time.monotonic()

  if _client is not None:
    try:
      _client.close()
    except Exception:
      pass

  _client = None


def _clear_connection_error():
  global _last_connection_error, _last_connection_error_at

  _last_connection_error = None
  _last_connection_error_at = None


def _get_cached_connection_error():
  if _last_connection_error is None or _last_connection_error_at is None:
    return None

  if (time.monotonic() - _last_connection_error_at) >= MONGODB_RETRY_COOLDOWN_SECONDS:
    return None

  return _last_connection_error


def get_storage_status():
  if not MONGODB_URI:
    return {
      "enabled": False,
      "reason": "MONGODB_URI is not configured.",
    }

  if MongoClient is None:
    return {
      "enabled": False,
      "reason": "Install pymongo and python-dotenv on the backend.",
    }

  if _database is not None:
    return {
      "enabled": True,
      "database": MONGODB_DB_NAME,
      "collection": MONGODB_PREDICTIONS_COLLECTION,
      "contactCollection": MONGODB_CONTACT_COLLECTION,
    }

  cached_error = _get_cached_connection_error()
  if cached_error:
    return {
      "enabled": False,
      "reason": cached_error,
    }

  try:
    get_database()
  except StorageUnavailableError as exc:  # pragma: no cover - depends on runtime DB state
    return {
      "enabled": False,
      "reason": str(exc),
    }

  return {
    "enabled": True,
    "database": MONGODB_DB_NAME,
    "collection": MONGODB_PREDICTIONS_COLLECTION,
    "contactCollection": MONGODB_CONTACT_COLLECTION,
  }


def get_database():
  global _client, _database

  if not MONGODB_URI or MongoClient is None:
    return None

  cached_error = _get_cached_connection_error()
  if cached_error:
    raise StorageUnavailableError(cached_error)

  if _database is not None:
    return _database

  if _database is None:
    try:
      if _client is None:
        client_kwargs = {
          "serverSelectionTimeoutMS": MONGODB_SERVER_SELECTION_TIMEOUT_MS,
          "connectTimeoutMS": MONGODB_CONNECT_TIMEOUT_MS,
          "socketTimeoutMS": MONGODB_SOCKET_TIMEOUT_MS,
        }
        if ServerApi and MONGODB_URI.startswith("mongodb"):
          client_kwargs["server_api"] = ServerApi("1")

        _client = MongoClient(MONGODB_URI, **client_kwargs)

      _client.admin.command("ping")
      _database = _client[MONGODB_DB_NAME]
      _clear_connection_error()
    except Exception as exc:
      _remember_connection_error(exc)
      raise StorageUnavailableError(str(exc)) from exc

  return _database


def save_prediction(features, result, metadata=None):
  database = get_database()
  if database is None:
    return None

  payload = {
    "createdAt": datetime.now(timezone.utc),
    "features": features,
    "result": result.get("result"),
    "prediction": result.get("prediction"),
    "gifUrl": result.get("gif_url"),
  }

  if metadata:
    payload["metadata"] = metadata

  collection = database[MONGODB_PREDICTIONS_COLLECTION]
  insert_result = collection.insert_one(payload)
  return str(insert_result.inserted_id)


def save_contact_message(name, email, message, metadata=None):
  database = get_database()
  if database is None:
    return None

  payload = {
    "createdAt": datetime.now(timezone.utc),
    "name": name,
    "email": email,
    "message": message,
  }

  if metadata:
    payload["metadata"] = metadata

  collection = database[MONGODB_CONTACT_COLLECTION]
  insert_result = collection.insert_one(payload)
  return str(insert_result.inserted_id)


def fetch_prediction_history(limit=10, user_id=None, user_email=None):
  try:
    database = get_database()
  except StorageUnavailableError:
    return []
  if database is None:
    return []

  collection = database[MONGODB_PREDICTIONS_COLLECTION]
  query = {}
  filters = []

  if user_id:
    filters.append({"metadata.userId": user_id})

  if user_email:
    filters.append({"metadata.userEmail": user_email})

  if len(filters) == 1:
    query = filters[0]
  elif len(filters) > 1:
    query = {"$or": filters}

  cursor = collection.find(query).sort("createdAt", -1).limit(limit)

  history = []
  for document in cursor:
    history.append(
      {
        "id": str(document["_id"]),
        "clientPredictionId": document.get("metadata", {}).get("clientPredictionId"),
        "createdAt": document["createdAt"].isoformat(),
        "features": document.get("features", {}),
        "result": document.get("result"),
        "prediction": document.get("prediction"),
        "gifUrl": document.get("gifUrl"),
        "metadata": document.get("metadata", {}),
      }
    )

  return history
