# -*- coding: utf-8 -*-

# -*- coding: utf-8 -*-

import config

from api import APIHandler, request_user_middleware
from aiohttp import web, ClientSession
from storage import DataBase
from utils import Logger
from vk import VkApi
import asyncio


logger = Logger("SERVER")


async def create_app(loop):
    app = web.Application(middlewares=[request_user_middleware])
    app.session = ClientSession()
    app.event_loop = loop

    # Database set-up
    database = DataBase(loop=loop)
    await database.setup()
    app.database = database

    # vk set-up
    app.vk = VkApi(config.service_token).get_api()

    app.router.add_route(method='POST', path='/api', handler=APIHandler)

    # Server set-up
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, port=config.PORT, host=config.HOST)
    return app, site


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    app, site = loop.run_until_complete(create_app(loop))
    loop.create_task(site.start())

    try:
        logger.ok('Сервер запущен')
        loop.run_forever()
    except KeyboardInterrupt:
        logger.critical('Сервер принудительно остановлен')


