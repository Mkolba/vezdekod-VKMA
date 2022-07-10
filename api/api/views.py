# -*- coding: utf-8 -*-

from .sections import BaseHandler, Autographs, Profile
from aiohttp import web


class APIHandler(web.View, BaseHandler):
    async def post(self):
        if self.request.data.method:
            section = self.request.data.method.split('.')[0] if '.' in self.request.data.method else ''
            handlers = {'autographs': Autographs, 'profile': Profile}
            if handlers.get(section, None):
                handler = handlers.get(section)
                return await handler(self.request).process()
            else:
                return self.unknown_method(section)
        else:
            return self.reject('Method is not passed', 404, log_data=self.request.data.method or ' ')

