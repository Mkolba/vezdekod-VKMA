# -*- coding: utf-8 -*-

from contextlib import asynccontextmanager
from utils import BetterDict
import asyncio
import asyncpg
import config
import json


class DataBase:
    def __init__(self, loop=None):
        self.loop = loop if loop else asyncio.get_event_loop()
        self.pool = None

    async def set_codecs(self, conn):
        await conn.set_type_codec('jsonb', encoder=json.dumps, decoder=BetterDict.loads, schema='pg_catalog')
        await conn.set_type_codec('json', encoder=json.dumps, decoder=BetterDict.loads, schema='pg_catalog')

    async def setup(self):
        self.pool = await asyncpg.create_pool(**config.database, init=self.set_codecs, min_size=5, max_size=15)

    @asynccontextmanager
    async def connect(self):
        conn = await self.pool.acquire()
        try:
            yield conn
        finally:
            await self.pool.release(conn)

