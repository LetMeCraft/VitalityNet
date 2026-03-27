import os
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

_client = None
_database = None


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

  try:
    get_database()
  except Exception as exc:  # pragma: no cover - depends on runtime DB state
    return {
      "enabled": False,
      "reason": str(exc),
    }

  return {
    "enabled": True,
    "database": MONGODB_DB_NAME,
    "collection": MONGODB_PREDICTIONS_COLLECTION,
  }


def get_database():
  global _client, _database

  if not MONGODB_URI or MongoClient is None:
    return None

  if _database is None:
    client_kwargs = {}
    if ServerApi and MONGODB_URI.startswith("mongodb"):
      client_kwargs["server_api"] = ServerApi("1")

    _client = MongoClient(MONGODB_URI, **client_kwargs)
    _client.admin.command("ping")
    _database = _client[MONGODB_DB_NAME]

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


def fetch_prediction_history(limit=10, user_id=None, user_email=None):
  database = get_database()
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
        "createdAt": document["createdAt"].isoformat(),
        "features": document.get("features", {}),
        "result": document.get("result"),
        "prediction": document.get("prediction"),
        "gifUrl": document.get("gifUrl"),
        "metadata": document.get("metadata", {}),
      }
    )

  return history
