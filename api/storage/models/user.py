# -*- coding: utf-8 -*-
from .base import BaseModel
from .autograph import Autograph


class User(BaseModel):
    def __init__(self, request, id):
        super().__init__(request)
        self.id = id

    def setup(self, data):
        self.id = data['user_id']
        self.settings = data['settings']
        return self

    async def get(self):
        sql = 'SELECT * FROM users WHERE user_id=$1'
        async with self.connect() as conn:
            data = await conn.fetchrow(sql, self.id)
            if data:
                return self.setup(data)

    async def create(self):
        values = (self.id, {
            'privacy': {
                'creation': {'banned': [], 'allowed': [], 'available_for': 'all'},
                'view': {'banned': [], 'allowed': [], 'available_for': 'all'}
            }
        })

        sql = f'INSERT INTO users VALUES ({self.arguments(len(values))}) RETURNING *'
        async with self.connect() as conn:
            data = await conn.fetchrow(sql, *values)

        return self.setup(data)

    async def commit(self):
        sql = 'UPDATE users SET settings=$2 WHERE user_id=$1'
        values = (self.id, self.settings)
        async with self.connect() as conn:
            await conn.execute(sql, *values)

    def can_create_autograph(self, user_id):
        privacy = self.settings.privacy.creation
        if privacy.available_for == 'nobody':
            return False
        elif privacy.available_for == 'all' and user_id not in privacy.banned:
            return True
        elif privacy.available_for == 'whitelist' and user_id in privacy.allowed:
            return True

    def can_view_autographs(self, user_id):
        privacy = self.settings.privacy.view
        if privacy.available_for == 'nobody':
            return False
        elif privacy.available_for == 'all' and user_id not in privacy.banned:
            return True
        elif privacy.available_for == 'whitelist' and user_id in privacy.allowed:
            return True

    async def get_autographs(self):
        sql = 'SELECT * FROM autographs WHERE user_id=$1 ORDER BY created_at DESC'
        async with self.connect() as conn:
            data = await conn.fetch(sql, self.id)

        users = await self._vk.users.get(user_ids=[item['from_id'] for item in data]) if data else []
        users = {item['id']: item for item in users}

        return [Autograph(self.request).setup(item).as_dict(users[item['from_id']]) for item in data] if data else []
