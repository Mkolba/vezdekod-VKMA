# -*- coding: utf-8 -*-
from datetime import datetime
from .base import BaseModel


class Autograph(BaseModel):
    def __init__(self, request, id=None):
        super().__init__(request)
        self.id = id

    def setup(self, data):
        self.id = data['id']
        self.user_id = data['user_id']
        self.text = data['text']
        self.image = data['image']
        self.from_id = data['from_id']
        self.created_at = data['created_at']
        return self

    async def get(self):
        sql = 'SELECT * FROM users WHERE id=$1'
        async with self.connect() as conn:
            data = await conn.fetchrow(sql, self.id)
            if data:
                return self.setup(data)

    def as_dict(self, user=None):
        return {
            'id': self.id, 'user_id': self.user_id, 'text': self.text, 'image': self.image,
            'from_id': self.from_id, 'created_at': self.created_at.timestamp(),
            'name': f'{user.first_name} {user.last_name}' if user else ''
        }

    async def create(self, user_id, from_id, text, image):
        values = (user_id, text, image, from_id, datetime.now())
        sql = f'INSERT INTO autographs(user_id, text, image, from_id, created_at) VALUES ({self.arguments(len(values))}) RETURNING *'
        async with self.connect() as conn:
            data = await conn.fetchrow(sql, *values)

        return self.setup(data)

    async def remove(self, user_id):
        sql = 'DELETE FROM autographs WHERE id=$1 AND user_id=$2 RETURNING *'
        async with self.connect() as conn:
            data = await conn.fetchrow(sql, self.id, user_id)

        return True if data else False
