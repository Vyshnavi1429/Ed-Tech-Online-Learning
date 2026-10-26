import os
from pymongo import MongoClient

client = MongoClient(os.environ["MONGODB_URI"])
db = client["edtech_db"]