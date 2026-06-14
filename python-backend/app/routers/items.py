from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(tags=["items"])

# In-memory store (production mein DB use karo)
items_db = [
    {"id": 1, "name": "Item One", "description": "First item", "price": 100.0},
    {"id": 2, "name": "Item Two", "description": "Second item", "price": 200.0},
]

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float

@router.get("/items", response_model=List[ItemResponse])
def get_items():
    return items_db

@router.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int):
    item = next((i for i in items_db if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: Item):
    new_id = max(i["id"] for i in items_db) + 1 if items_db else 1
    new_item = {"id": new_id, **item.dict()}
    items_db.append(new_item)
    return new_item

@router.delete("/items/{item_id}")
def delete_item(item_id: int):
    global items_db
    item = next((i for i in items_db if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    items_db = [i for i in items_db if i["id"] != item_id]
    return {"message": f"Item {item_id} deleted"}
