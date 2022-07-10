# -*- coding: utf-8 -*-
from aiohttp import web
from utils import Logger, json_serial
import json

logger = Logger("API")


class BaseHandler:
    def __init__(self, request):
        self.database = request.app.database
        self.method = request.data.method
        self.data = request.data
        self.user = request.user
        self.request = request
        self.logger = logger

    @staticmethod
    def _response(data, jsonify=True):
        resp = web.Response(body=(json.dumps(data, default=json_serial)) if jsonify else data)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        resp.headers['Content-Type'] = 'application/json'
        return resp

    def response(self, message=None, jsonify=True, **kwargs):
        kwargs.update({'success': True})
        if message:
            kwargs.update({"message": message})
        logger.ok(f'Approved {self.data.method}', prefix='API')
        return self._response(kwargs) if jsonify else self._response(message, False)

    def reject(self, message=None, code=0, log_data=None, **kwargs):
        response = {'success': False, 'code': code}
        response.update(kwargs)
        if not log_data:
            logger.info(f'Declined {self.data.method} ({self.data}) (Reason: {message})', prefix='API')
        else:
            logger.info(f'Unknown Method Passed ({log_data})')
        if message:
            response.update({'message': message})
        return self._response(response)

    def unknown_method(self, log_data=None):
        return self.reject('Unknown Method Passed', 404, log_data=log_data)

    def get_handler(self):
        blacklist = ['unknown_method', 'get_handler', 'response', 'reject', 'process']
        methods = {n: getattr(self, n) for n in dir(self) if not n.startswith('_') and n not in blacklist}
        return methods.get(self.method.split('.')[1], None)

    async def process(self):
        handler = self.get_handler()
        if handler:
            return await handler()
        else:
            return self.unknown_method()
