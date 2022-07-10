# -*- coding: utf-8 -*-

from storage.models import User
from .base import BaseHandler


class Profile(BaseHandler):
    async def setPrivacy(self):
        self.user.settings.privacy[self.data.type]['available_for'] = self.data.mode
        await self.user.commit()
        return self.response('Настройки приватности обновлены')

    async def addUserToWhitelist(self):
        vk_user = (await self.request.app.vk.users.get(user_ids=self.data.user_id, fields='photo_200'))[0]
        if not vk_user:
            return self.reject('Указанный пользователь не найден')

        if vk_user['id'] in self.user.settings.privacy[self.data.type]['allowed']:
            return self.reject('Этот пользователь уже есть в списке')

        if vk_user['id'] == self.user.id:
            return self.reject('Вы не можете добавить себя в этот список')

        self.user.settings.privacy[self.data.type]['allowed'].append(vk_user['id'])
        await self.user.commit()

        return self.response(user=vk_user)

    async def removeUserFromWhitelist(self):
        if self.data.user_id not in self.user.settings.privacy[self.data.type]['allowed']:
            return self.reject('Указанного пользователя нет в этом списке')

        self.user.settings.privacy[self.data.type]['allowed'] = [item for item in self.user.settings.privacy[self.data.type]['allowed'] if item != self.data.user_id]
        await self.user.commit()

        return self.response('Пользователь удалён из списка')

    async def get(self):
        if self.data.user_id and self.data.user_id != self.user.id:
            user = await User(self.request, self.data.user_id).get()
            if user:
                can_create = user.can_create_autograph(self.user.id)
                can_view = user.can_view_autographs(self.user.id)
                autographs = await user.get_autographs() if can_view else []
                user = (await self.request.app.vk.users.get(user_id=user.id, fields='first_name_gen'))[0]
                return self.response(autographs=[item for item in autographs], can_create=can_create, can_view=can_view, user_id=user.id, username=user['first_name_gen'])
            else:
                return self.reject('Этот пользователь еще не создал свой профиль')
        else:
            autographs = await self.user.get_autographs()

            users = self.user.settings.privacy.view.allowed + self.user.settings.privacy.creation.allowed
            users = await self.request.app.vk.users.get(user_ids=users)
            users = {item['id']: item for item in users}

            self.user.settings.privacy.creation.allowed = [users[item] for item in self.user.settings.privacy.creation.allowed]
            self.user.settings.privacy.view.allowed = [users[item] for item in self.user.settings.privacy.view.allowed]

            return self.response(autographs=[item for item in autographs], can_create=False, can_view=True, user_id=self.user.id, settings=self.user.settings)
