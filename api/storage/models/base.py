# -*- coding: utf-8 -*-
from utils import Logger


class BaseModel:
    def __init__(self, request):
        self.connect = request.app.database.connect
        self.request = request
        self.logger = Logger()
        self.app = request.app
        self._vk = self.app.vk

    @staticmethod
    def arguments(count):
        return ','.join([f'${i}' for i in range(1, count + 1)])
