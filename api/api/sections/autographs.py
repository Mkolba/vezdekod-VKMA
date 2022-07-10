# -*- coding: utf-8 -*-

from storage.models import User, Autograph
from .base import BaseHandler
from uuid import uuid4
import config
import base64
import regex


class Autographs(BaseHandler):
    async def create(self):
        user = await User(self.request, self.data.user_id).get()

        if not user:
            return self.reject('Указанного пользователя не существует')

        if user.id == self.user.id:
            return self.reject('Вы не можете оставить автограф в своём профиле')

        can_create = user.can_create_autograph(self.user.id)

        if not can_create:
            return self.reject('Вы не можете оставить автограф в профиле этого пользователя')

        if not self.data.image and not self.data.text:
            return self.reject('Укажите текст автографа или прикрепите фотографию')

        if self.data.image:
            if not regex.findall('data:image/\w+;base64,', self.data.image):
                return self.reject('Фотография должна быть закодирована в формате Base64')

            image = base64.decodebytes(self.data.image.split(',')[-1].encode('utf-8'))
            image_uuid = str(uuid4())
            with open(config.images_dir + image_uuid + '.jpg', 'wb') as f:
                f.write(image)

        else:
            image_uuid = None

        autograph = await Autograph(self.request).create(user.id, self.user.id, self.data.text, image_uuid)
        return self.response(autograph=autograph.as_dict())

    async def remove(self):
        result = await Autograph(self.request, self.data.autograph_id).remove(self.user.id)
        if not result:
            return self.reject('Автограф с таким идентификатором не найден в вашем профиле')

        return self.response('Автограф удалён')
